import os
import json
import importlib
from typing import List
from pydantic import BaseModel, Field
from google import genai

types = importlib.import_module("google.genai.types")


class IndicatorOfCompromise(BaseModel):
    ioc_type: str = Field(description="Type of IoC, e.g., IP Address, Domain, File Hash, Registry Key")
    value: str = Field(description="The specific value of the IoC")
    confidence: str = Field(description="Confidence level: High, Medium, Low")


class TimelineEvent(BaseModel):
    timestamp: str = Field(description="Timestamp of the event from the logs")
    description: str = Field(description="Short description of what happened")


class ConditionBAnalysis(BaseModel):
    summary: str = Field(description="Executive summary of the security incident")
    iocs: List[IndicatorOfCompromise] = Field(description="Extracted Indicators of Compromise")
    timeline: List[TimelineEvent] = Field(description="Constructed incident timeline")
    recommended_action: str = Field(description="Immediate remediation or containment steps")


def run_condition_b_evaluation(log_file_path: str, output_report_path: str) -> None:
    print(f"[*] Reading telemetry from: {log_file_path}")
    if not os.path.exists(log_file_path):
        raise FileNotFoundError(f"Telemetry file not found: {log_file_path}")

    with open(log_file_path, "r", encoding="utf-8") as f:
        raw_logs = f.read()

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise EnvironmentError("Set GEMINI_API_KEY before running.")
    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=300000), 
    )

    system_prompt = (
        "You are an autonomous Tier-3 Security Operations Center (SOC) AI investigator. "
        "Analyze the provided raw security telemetry end-to-end without human intervention. "
        "Extract all actionable Indicators of Compromise (IoCs), build a precise chronological timeline, "
        "and provide a concise assessment."
    )

    print("[*] Dispatching telemetry to LLM for autonomous analysis...")
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=f"Here is the raw telemetry to investigate:\n\n{raw_logs}",
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.0,
            response_mime_type="application/json",
            response_schema=ConditionBAnalysis,
        ),
    )

    # .parsed returns a ConditionBAnalysis instance; fall back to manual validation
    analysis_result = response.parsed or ConditionBAnalysis.model_validate_json(response.text)

    with open(output_report_path, "w", encoding="utf-8") as out_f:
        json.dump(analysis_result.model_dump(), out_f, indent=4)

    print(f"[+] Condition B run complete. Report saved to: {output_report_path}")


if __name__ == "__main__":
    sample_log = "test_telemetry_case1.log"
    output_json = "condition_b_result.json"

    if not os.path.exists(sample_log):
        with open(sample_log, "w") as f:
            f.write("[2026-10-08T03:12:00Z] Sysmon: Process Create - C:\\Windows\\System32\\cmd.exe "
                    "executed by powershell.py with suspicious outbound connection to 192.0.2.45")

    run_condition_b_evaluation(sample_log, output_json)