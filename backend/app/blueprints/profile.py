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
        #print("Request received:", request.json)
        user_id = get_jwt_identity()
        print("Author ID:", user_id)
        user = User.find_user_by_id(user_id)
        print(user)
        return user, 201
    except Exception as e:
        print("Error finding user:", str(e))
        return {"message": "Error finding user", "error": str(e)}, 500

@profile_bp.route("/set", methods=["POST"])
@jwt_required()
def set_profile_info():
    try:
        user_id = get_jwt_identity()
        print(request.json)
        username = request.json.get("username")
        email = request.json.get("email")
        print(
            "Parsed data:", {"username": username, "email": email, "user_id": user_id}
        )
        
        return User.update_user_email(user_id, username, email)
    except Exception as e:
        print("Error finding user:", str(e))
        return {"message": "Error finding user", "error": str(e)}, 500
