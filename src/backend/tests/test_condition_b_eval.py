"""Tests for the Condition B runner using a stubbed model response."""

import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from pydantic import ValidationError

from app.ai.condition_b_eval import (
    AVAILABLE_MODELS,
    ConditionBModelAnalysis,
    ConditionBResult,
    analyze_condition_b,
    main,
    run_interactive_cli,
    run_condition_b_evaluation,
)
from app.schemas.scenario import ScenarioInput


class StubModels:
    def __init__(self, response):
        self.response = response
        self.request = None

    def generate_content(self, *, model, contents, config):
        self.request = {
            "model": model,
            "contents": contents,
            "config": config,
        }
        return self.response


class ConditionBEvaluationTests(unittest.TestCase):
    def setUp(self):
        self.scenario = ScenarioInput.model_validate(
            {
                "id": "case-demo",
                "version": "0.1",
                "title": "Synthetic network event",
                "evidence": [
                    {
                        "id": "E01",
                        "type": "network",
                        "text": "Connection attempt to 192.0.2.45",
                    }
                ],
            }
        )
        self.analysis = ConditionBModelAnalysis(
            summary="The evidence records a connection attempt.",
            reported_iocs=[
                {
                    "type": "ip",
                    "value": "192.0.2.45",
                    "evidence_ids": ["E01"],
                    "confidence": "Medium",
                }
            ],
            timeline=[
                {
                    "timestamp": "2026-10-08T03:12:00Z",
                    "description": "A connection attempt was recorded.",
                    "evidence_ids": ["E01"],
                }
            ],
            recommended_actions=["Review related network records."],
        )

    def test_uses_shared_scenario_and_returns_scoreable_metadata(self):
        models = StubModels(SimpleNamespace(parsed=self.analysis, text=None))
        with patch.dict("os.environ", {"GEMINI_MODEL": "test-model"}, clear=True):
            result = analyze_condition_b(
                self.scenario,
                client=SimpleNamespace(models=models),
            )

        self.assertEqual(result.scenario_id, "case-demo")
        self.assertEqual(result.scenario_version, "0.1")
        self.assertEqual(result.condition, "B")
        self.assertEqual(result.model, "test-model")
        self.assertEqual(result.prompt_version, "condition-b-v1")
        self.assertGreaterEqual(result.run_duration_ms, 0)
        self.assertEqual(
            result.reported_iocs[0].model_dump(),
            {
                "type": "ip",
                "value": "192.0.2.45",
                "evidence_ids": ["E01"],
                "confidence": "Medium",
            },
        )
        self.assertIn('"id":"case-demo"', models.request["contents"])
        self.assertIn("E01", models.request["contents"])
        self.assertEqual(models.request["model"], "test-model")
        self.assertEqual(models.request["config"]["temperature"], 0.0)

    def test_explicit_model_selection_is_used_and_recorded(self):
        models = StubModels(SimpleNamespace(parsed=self.analysis, text=None))
        result = analyze_condition_b(
            self.scenario,
            client=SimpleNamespace(models=models),
            model=AVAILABLE_MODELS[1],
        )

        self.assertEqual(models.request["model"], AVAILABLE_MODELS[1])
        self.assertEqual(result.model, AVAILABLE_MODELS[1])

    def test_interactive_model_command_selects_model_for_run(self):
        commands = iter(
            ["/model", "2", "/run", "scenario.json", "result.json", "/quit"]
        )
        prompts = []
        output = []
        with patch(
            "app.ai.condition_b_eval.run_condition_b_evaluation",
            return_value=SimpleNamespace(model=AVAILABLE_MODELS[1]),
        ) as run:
            run_interactive_cli(
                input_fn=lambda prompt: prompts.append(prompt) or next(commands),
                output_fn=output.append,
            )

        run.assert_called_once_with(
            "scenario.json",
            "result.json",
            model=AVAILABLE_MODELS[1],
        )
        self.assertGreaterEqual(len(AVAILABLE_MODELS), 5)
        self.assertTrue(any(AVAILABLE_MODELS[1] in line for line in output))

    def test_interactive_model_picker_reprompts_on_invalid_choice(self):
        commands = iter(["/model", "0", "6", "1", "/quit"])
        prompts = []
        output = []
        run_interactive_cli(
            input_fn=lambda prompt: prompts.append(prompt) or next(commands),
            output_fn=output.append,
        )

        self.assertTrue(any("Choose a number from 1 to 5" in line for line in output))

    def test_cli_model_option_is_forwarded_to_runner(self):
        with patch(
            "app.ai.condition_b_eval.run_condition_b_evaluation"
        ) as run:
            main(["scenario.json", "result.json", "--model", AVAILABLE_MODELS[2]])

        run.assert_called_once_with(
            Path("scenario.json"),
            Path("result.json"),
            model=AVAILABLE_MODELS[2],
        )

    def test_rejects_unknown_evidence_references(self):
        invalid_analysis = self.analysis.model_copy(deep=True)
        invalid_analysis.reported_iocs[0].evidence_ids = ["NOT-IN-SCENARIO"]
        client = SimpleNamespace(
            models=StubModels(SimpleNamespace(parsed=invalid_analysis, text=None))
        )

        with self.assertRaisesRegex(ValueError, "unknown evidence IDs"):
            analyze_condition_b(self.scenario, client=client)

    def test_rejects_ioc_types_outside_the_scoring_contract(self):
        with self.assertRaises(ValidationError):
            ConditionBModelAnalysis(
                summary="Unsupported IOC type.",
                reported_iocs=[
                    {
                        "type": "registry_key",
                        "value": "HKLM\\Software\\Example",
                        "evidence_ids": ["E01"],
                        "confidence": "High",
                    }
                ],
                timeline=[],
                recommended_actions=[],
            )

    def test_validates_json_text_when_provider_has_no_parsed_value(self):
        models = StubModels(
            SimpleNamespace(parsed=None, text=self.analysis.model_dump_json())
        )
        result = analyze_condition_b(
            self.scenario,
            client=SimpleNamespace(models=models),
        )

        self.assertEqual(result.reported_iocs[0].type, "ip")

    def test_requires_credentials_without_an_injected_client(self):
        with patch.dict("os.environ", {}, clear=True):
            with self.assertRaisesRegex(EnvironmentError, "GEMINI_API_KEY"):
                analyze_condition_b(self.scenario)

    def test_rejects_empty_provider_response(self):
        client = SimpleNamespace(
            models=StubModels(SimpleNamespace(parsed=None, text=None))
        )

        with self.assertRaisesRegex(ValueError, "no structured response"):
            analyze_condition_b(self.scenario, client=client)

    def test_file_runner_reads_shared_schema_and_writes_result(self):
        result = ConditionBResult(
            **self.analysis.model_dump(),
            scenario_id=self.scenario.id,
            scenario_version=self.scenario.version,
            model="test-model",
            prompt_version="condition-b-v1",
            run_duration_ms=12,
        )
        with tempfile.TemporaryDirectory() as directory:
            input_path = Path(directory) / "scenario.json"
            output_path = Path(directory) / "result.json"
            input_path.write_text(self.scenario.model_dump_json(), encoding="utf-8")
            with patch(
                "app.ai.condition_b_eval.analyze_condition_b",
                return_value=result,
            ) as analyze:
                written_result = run_condition_b_evaluation(input_path, output_path)

            self.assertEqual(written_result, result)
            analyze.assert_called_once()
            report = json.loads(output_path.read_text(encoding="utf-8"))
            self.assertEqual(report["scenario_id"], "case-demo")
            self.assertEqual(report["reported_iocs"][0]["type"], "ip")


if __name__ == "__main__":
    unittest.main()
