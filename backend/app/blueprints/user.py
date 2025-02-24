from flask_restful import Resource, request
from app.models.user import User
from flask import Blueprint
from flask import Blueprint

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