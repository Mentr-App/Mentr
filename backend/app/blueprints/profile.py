from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from flask import request, Blueprint
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment
from flask_restful import Resource
from bson import ObjectId
from app.database import mongo
from app.extensions import img_handler
import time

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
    

@profile_bp.route("/upload_profile_picture", methods=["POST"])
@jwt_required()
def upload_profile_picture():
    try:
        if 'file' not in request.files:
            return {"message": "No file provided"}, 400
        
        file = request.files['file']
        if not file.filename:
            return {"message": "No file selected"}, 400
            
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
        if not file.filename.lower().rsplit('.', 1)[1] in allowed_extensions:
            return {"message": "File type not allowed"}, 400
            
        user_id = get_jwt_identity()
        print("Uploading for user:", user_id)
        
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        print("Current user data:", user)
        
        if user and "profile_picture" in user:
            print("Deleting old picture:", user["profile_picture"])
            img_handler.delete(user["profile_picture"])
            
        filename = f"profile_pictures/{user_id}_{int(time.time())}.{file.filename.rsplit('.', 1)[1]}"
        print("New filename:", filename)
        
        img_handler.create(filename, file)
        print("File uploaded to storage")
        
        result = mongo.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"profile_picture": filename}}
        )
        print("Database updated, modified count:", result.modified_count)
        
        return {"message": "Profile picture updated successfully", "filename": filename}, 200
        
    except Exception as e:
        print(f"Error uploading profile picture: {str(e)}")
        return {"message": "Error uploading profile picture"}, 500

@profile_bp.route("/get_profile_picture", methods=["GET"])
@jwt_required()
def get_profile_picture():
    try:
        user_id = get_jwt_identity()
        user = User.find_user_by_id(user_id)
        
        print("User data:", user)
        print("Profile picture field:", user.get('profile_picture') if user else None)
        
        if not user or 'profile_picture' not in user:
            return {"message": "No profile picture found"}, 404
            
        picture_url = img_handler.get(user['profile_picture'])
        print("Generated URL:", picture_url)
        
        if not picture_url:
            return {"message": "Profile picture not found in storage"}, 404
            
        return {"profile_picture_url": picture_url}, 200
        
    except Exception as e:
        print("Error getting profile picture:", str(e))
        return {"message": "Error getting profile picture", "error": str(e)}, 500

@profile_bp.route("/get_profile_info/<user_id>", methods=["GET"])
def get_profile_info_by_id(user_id):
    try:
        user = User.find_user_by_id(user_id)
            
        if not user:
            return {"message": "User not found"}, 404
            
        response = {
            "userType": user.get("userType"),
            "profile_picture_url": None
        }
        print(user["userType"])
        if user.get("userType") == "Mentee":
            response["major"] = user.get("major")
        elif user.get("userType") == "Mentor":
            response["company"] = user.get("company")
            response["industry"] = user.get("industry")
            
        if 'profile_picture' in user:
            picture_url = img_handler.get(user['profile_picture'])
            if picture_url:
                response["profile_picture_url"] = picture_url
        
        return response, 200
        
    except Exception as e:
        print("Error getting user info:", str(e))
        return {"message": "Error getting user info", "error": str(e)}, 500
        
@profile_bp.route("/get_user_posts", methods=["GET"])
def get_user_posts():
    try:
        username = request.args.get('username')
        posts = Post.get_posts_by_author(username)
        return posts, 201
    except Exception as e:
        print("Error finding user:", str(e))
        return {"message": "Error finding user", "error": str(e)}, 500

@profile_bp.route("/get_user_comments", methods=["GET"])
def get_user_comments():
    try:
        username = request.args.get('username')
        comments = Comment.get_comments_by_author(username)
        return comments, 201
    except Exception as e:
        print("Error finding user:", str(e))
        return {"message": "Error finding user", "error": str(e)}, 500
