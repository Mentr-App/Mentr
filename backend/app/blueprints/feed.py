from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from app.models.feed import Feed
from flask import Blueprint

feed_bp = Blueprint("feed", __name__)

@feed_bp.route("/", methods=["GET"])
def get_feed():
    feed_result = Feed.get_feed()
    print("feed_result:",feed_result)
    return {"message": "Feed retrieved successfully", "feed": feed_result}, 200