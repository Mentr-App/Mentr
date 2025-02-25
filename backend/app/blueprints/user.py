from flask_restful import request
from app.models.user import User
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import mongo

user_bp = Blueprint("user", __name__)

@user_bp.route("/", methods=["GET"])
def get():
    """Retrieve user details by username."""
    #TODO
    username = request.json.get("username")

    user = User.find_user(username)
    if user:
        return user, 200
    return {"message": "User not found"}, 404

@user_bp.route("/", methods=["DELETE"])
def delete():
    """Delete a user by username."""
    username = request.json.get("username")

    return User.delete_user(username)

@user_bp.route("/votes", methods=["GET"])
@jwt_required()
def get_user_votes():
    """Get all posts that the current user has voted on"""
    user_id = get_jwt_identity()
    
    # Find all posts where the user has voted
    posts = mongo.db.posts.find(
        {"votes": {"$elemMatch": {"user_id": user_id}}},
        {"votes": {"$elemMatch": {"user_id": user_id}}}
    )
    
    # Create a map of post_id to vote_type
    votes_map = {
        str(post["_id"]): post["votes"][0]["vote_type"]
        for post in posts
    }
    
    return {"votes": votes_map}, 200