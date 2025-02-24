from flask_restful import Resource, request
from app.database import mongo
from flask import Blueprint
test_bp = Blueprint("test", __name__)

@test_bp.route("/", methods = ["GET"])
def test():
    try:
        mongo.db.command("ping")
        return {"message": "mongodb connection success"}, 200
    except Exception as e:
        return {"error": str(e)}, 500