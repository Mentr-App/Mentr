from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from flask import request, Blueprint
from app.models.user import User
from flask_restful import Resource
from bson import ObjectId
from app.database import mongo

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/", methods=["GET"])
@jwt_required()
def get_profile_info():
    try:
        user_id = get_jwt_identity()
        user = User.find_user_by_id(user_id)
        return user, 201
    except Exception as e:
        print("Error finding user:", str(e))
        return {"message": "Error finding user", "error": str(e)}, 500

@profile_bp.route("/set", methods=["POST"])
@jwt_required()
def set_profile_info():
    try:
        user_id = get_jwt_identity()
        username = request.json.get("username")
        email = request.json.get("email")
        userType = request.json.get("userType")
        major = request.json.get("major")
        company = request.json.get("company")
        industry = request.json.get("industry")
        linkedin = request.json.get("linkedin")
        instagram = request.json.get("instagram")
        twitter = request.json.get("twitter")
        
        return User.update_user(
            user_id,
            username,
            email,
            userType,
            major,
            company,
            industry,
            linkedin,
            instagram,
            twitter,
        )
    except Exception as e:
        print("Error updating user profile:", str(e))
        return {"message": "Error updating user profile", "error": str(e)}, 500

@profile_bp.route("/delete", methods=["POST"])
@jwt_required()
def delete_profile_info():
    try:
        user_id = get_jwt_identity()
        user = User.find_user_by_id(user_id)
        
        return User.delete_user(user["username"])
    except Exception as e:
        print("Error finding user:", str(e))
        return {"message": "Error finding user", "error": str(e)}, 500
