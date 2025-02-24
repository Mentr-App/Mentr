from flask import Flask, request, make_response
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager
from app.database import mongo
from app.config import config_by_name
from app.extensions import jwt
from app.blueprints import register_blueprints

def create_app(config_name="development"):
    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, "development"))

    #Enable cors
    CORS(app, supports_credentials=True, allow_headers=["Authorization", "Content-Type"])

    #Init JWT tokens
    jwt.init_app(app)

    #Init mongo app
    mongo.init_app(app)

    #Create restful api
    api = Api(app)

    #Register API resources
    register_blueprints(app)
    return app

    