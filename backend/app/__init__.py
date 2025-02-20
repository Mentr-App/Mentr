from flask import Flask
from flask_restful import Api
from flask_jwt_extended import JWTManager
from app.database import mongo
from app.routes import register_resources
from app.config import config_by_name
from app.extensions import jwt

def create_app(config_name="development"):
    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, "development"))

    #Init JWT tokens
    jwt.init_app(app)

    #Init mongo app
    mongo.init_app(app)

    #Create restful api
    api = Api(app)

    #Register API resources
    register_resources(api)

    return app

    