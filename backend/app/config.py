import os
from dotenv import load_dotenv

load_dotenv(".env.development")

class Config():
    """Base configuration (common settings)"""

    # General Flask Config
    SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    TESTING = False

    #MongoDB Config
    MONGO_URI = os.getenv("MONGO_URI", "default_mongo_uri")

    #JWT Config
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default_jwt_secret_key")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 86400))
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = "mentr448@gmail.com"
    MAIL_PASSWORD = "ludl fawi ohen vstk"
    MAIL_DEFAULT_SENDER = "mentr448@gmail.com"
    
class DevelopmentConfig(Config):
    """Development Configuration (for local development)"""
    DEBUG = True

class TestingConfig(Config):
    """Testing Configuration (for unit tests)"""
    DEBUG = True
    TESTING = True

config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig
}