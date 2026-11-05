"""Synthetic unit tests for the draft evaluation scorer."""

import unittest

from metric_scoring import evaluate_trial, score_iocs


class MetricScoringTests(unittest.TestCase):
    def test_example_two_tp_one_fp_one_fn(self):
        truth = [
            {"type": "ip", "value": "192.0.2.10"},
            {"type": "ip", "value": "192.0.2.20"},
            {"type": "domain", "value": "alpha.example"},
        ]
        reported = [
            {"type": "ip", "value": "192.0.2.10"},
            {"type": "domain", "value": "ALPHA[.]EXAMPLE."},
            {"type": "ip", "value": "192.0.2.99"},
        ]
        result = score_iocs(truth, reported)
        self.assertEqual((result["tp"], result["fp"], result["fn"]), (2, 1, 1))
        self.assertAlmostEqual(result["f1"], 2 / 3)

    def test_both_empty_not_perfect(self):
        result = score_iocs([], [])
        self.assertIsNone(result["precision"])
        self.assertIsNone(result["recall"])
        self.assertIsNone(result["f1"])

    def test_no_predictions(self):
        result = score_iocs([{"type": "ip", "value": "192.0.2.10"}], [])
        self.assertIsNone(result["precision"])
        self.assertEqual(result["recall"], 0)
        self.assertEqual(result["f1"], 0)

    def test_duplicate_reported_ioc_not_double_counted(self):
        truth = [{"type": "domain", "value": "alpha.example"}]
        reported = truth + [{"type": "domain", "value": "ALPHA.EXAMPLE"}]
        self.assertEqual(score_iocs(truth, reported)["tp"], 1)

    def test_unsupported_type_requires_review(self):
        with self.assertRaises(ValueError):
            score_iocs([{"type": "process_path", "value": "powershell.exe"}], [])

    def test_duration_and_first_triage(self):
        trial = self.valid_trial()
        result = evaluate_trial(trial)
        self.assertEqual(result["duration_seconds"], 95)
        self.assertEqual(result["first_triage_seconds"], 30)

    def test_missing_submit_is_missing_duration(self):
        trial = self.valid_trial()
        trial["events"] = trial["events"][:1]
        self.assertIsNone(evaluate_trial(trial)["duration_seconds"])

    def test_negative_elapsed_time_rejected(self):
        trial = self.valid_trial()
        trial["events"][0]["elapsed_ms"] = -1
        with self.assertRaises(ValueError):
            evaluate_trial(trial)

    def test_duplicate_event_id_is_idempotent(self):
        trial = self.valid_trial()
        trial["events"].append(dict(trial["events"][1]))
        self.assertEqual(evaluate_trial(trial)["duration_seconds"], 95)

    def test_conflicting_duplicate_event_rejected(self):
        trial = self.valid_trial()
        trial["events"].append({"event_id": "evt-2", "event_type": "submit", "elapsed_ms": 96000})
        with self.assertRaises(ValueError):
            evaluate_trial(trial)

    def test_condition_a_cannot_expose_ai(self):
        trial = self.valid_trial()
        trial["condition"] = "A"
        trial["events"].append({"event_id": "evt-4", "event_type": "ai_suggestion_shown", "elapsed_ms": 40000})
        with self.assertRaises(ValueError):
            evaluate_trial(trial)

    def test_double_submit_rejected(self):
        trial = self.valid_trial()
        trial["events"].append({"event_id": "evt-3", "event_type": "submit", "elapsed_ms": 100000})
        with self.assertRaises(ValueError):
            evaluate_trial(trial)

    @staticmethod
    def valid_trial():
        return {
            "session_id": "trial-demo-001",
            "scenario_id": "case_01",
            "scenario_version": "1.0",
            "condition": "C",
            "truth_iocs": [{"type": "ip", "value": "192.0.2.10"}],
            "reported_iocs": [{"type": "ip", "value": "192.0.2.10"}],
            "events": [
                {"event_id": "evt-1", "event_type": "triage_marked", "elapsed_ms": 30000},
                {"event_id": "evt-2", "event_type": "submit", "elapsed_ms": 95000},
            ],
        }


if __name__ == "__main__":
    unittest.main()
