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
        two_factor_enabled = request.json.get("two_factor_enabled") 
        linkedin = request.json.get("linkedin")
        instagram = request.json.get("instagram")
        twitter = request.json.get("twitter")
        print(two_factor_enabled)
        
        return User.update_user(
            user_id=user_id,
            username=username,
            email=email,
            userType=userType,
            major=major,
            company=company,
            industry=industry,
            linkedin=linkedin,
            instagram=instagram,
            twitter=twitter,
            two_factor_enabled=two_factor_enabled
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
    
@profile_bp.route("/set_password", methods=["POST"])
@jwt_required()
def set_password():
    try:
        password = request.json.get("password")
        user_id = get_jwt_identity()
        User.set_password(password, user_id)
        return {"message": "successfully set"},200
    except Exception as e:
        print("Error setting password:", str(e))
        return {"message": "Error setting password", "error": str(e)}, 500
    
