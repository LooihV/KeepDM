from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    JWT_SECRET_KEY: str = "your_jwt_secret_key_change_this_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    MONGO_HOST: str = "localhost"
    MONGO_PORT: int = 27017
    MONGO_INITDB_ROOT_USERNAME: str = "admin"
    MONGO_INITDB_ROOT_PASSWORD: str = "password"
    MONGO_DB: str = "keepdm_db"
    MONGO_URL: str | None = None

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def mongo_uri(self) -> str:
        if self.MONGO_URL:
            return self.MONGO_URL
        return (
            f"mongodb://{self.MONGO_INITDB_ROOT_USERNAME}:{self.MONGO_INITDB_ROOT_PASSWORD}"
            f"@{self.MONGO_HOST}:{self.MONGO_PORT}/{self.MONGO_DB}?authSource=admin"
        )


settings = Settings()
