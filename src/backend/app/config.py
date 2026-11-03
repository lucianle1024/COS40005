"""Local application settings; environment overrides use SOC_ prefix."""
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="SOC_", extra="ignore")
    app_name: str = "COS40005 SOC Backend"
    allowed_origins: list[str] = ["http://127.0.0.1:5173", "http://localhost:5173"]
