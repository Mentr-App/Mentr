from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from flask import jsonify, request, Blueprint
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
            two_factor_enabled=two_factor_enabled,
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
        return {"message": "successfully set"}, 200
    except Exception as e:
        print("Error setting password:", str(e))
        return {"message": "Error setting password", "error": str(e)}, 500


@profile_bp.route("/upload_profile_picture", methods=["POST"])
@jwt_required()
def upload_profile_picture():
    try:
        if "file" not in request.files:
            return {"message": "No file provided"}, 400

        file = request.files["file"]
        if not file.filename:
            return {"message": "No file selected"}, 400

        allowed_extensions = {"png", "jpg", "jpeg", "gif"}
        if not file.filename.lower().rsplit(".", 1)[1] in allowed_extensions:
            return {"message": "File type not allowed"}, 400

        user_id = get_jwt_identity()
        print("Uploading for user:", user_id)

        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        print("Current user data:", user)
        print("profile_picture" in user)

        if user and "profile_picture" in user and user["profile_picture"]:
            print("Deleting old picture:", user["profile_picture"])
            img_handler.delete(user["profile_picture"])

        filename = f"profile_pictures/{user_id}_{int(time.time())}.{file.filename.rsplit('.', 1)[1]}"
        print("New filename:", filename)

        img_handler.create(filename, file)
        print("File uploaded to storage")

        result = mongo.db.users.update_one(
            {"_id": ObjectId(user_id)}, {"$set": {"profile_picture": filename}}
        )
        print("Database updated, modified count:", result.modified_count)

        return {
            "message": "Profile picture updated successfully",
            "filename": filename,
        }, 200

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
        print("Profile picture field:", user.get("profile_picture") if user else None)

        if not user or "profile_picture" not in user:
            return {"message": "No profile picture found"}, 404

        picture_url = img_handler.get(user["profile_picture"])
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

        response = {"userType": user.get("userType"), "profile_picture_url": None}
        print(user["userType"])
        if user.get("userType") == "Mentee":
            response["major"] = user.get("major")
        elif user.get("userType") == "Mentor":
            response["company"] = user.get("company")
            response["industry"] = user.get("industry")

        if "profile_picture" in user:
            picture_url = img_handler.get(user["profile_picture"])
            if picture_url:
                response["profile_picture_url"] = picture_url

        return response, 200

    except Exception as e:
        print("Error getting user info:", str(e))
        return {"message": "Error getting user info", "error": str(e)}, 500


@profile_bp.route("/get_user_posts", methods=["GET"])
def get_user_posts():
    try:
        username = request.args.get("username")
        posts = Post.get_posts_by_author(username)
        return posts, 201
    except Exception as e:
        print("Error finding user:", str(e))
        return {"message": "Error finding user", "error": str(e)}, 500


@profile_bp.route("/get_user_comments", methods=["GET"])
def get_user_comments():
    try:
        username = request.args.get("username")
        comments = Comment.get_comments_by_author(username)
        return comments, 201
    except Exception as e:
        print("Error finding user:", str(e))
        return {"message": "Error finding user", "error": str(e)}, 500


@profile_bp.route("/public", methods=["GET"])
def get_public_profile():
    userID = request.args.get("userID")

    if not userID:
        return (
            jsonify(
                {
                    "error": "UserID parameter is required",
                    "example": "/profile/public?userID=nicksong04",
                }
            ),
            400,
        )

    try:
        user = User.find_user_by_id(userID)

        if not user:
            return (
                jsonify(
                    {
                        "error": "User not found",
                        "message": f"No profile found for userID: {userID}",
                    }
                ),
                404,
            )
        public_profile = user
        if (
            "profile_picture" in public_profile
            and public_profile["profile_picture"] != None
        ):
            public_profile["profile_picture"] = img_handler.get(user["profile_picture"])

        return public_profile, 200

    except Exception as e:
        print("Error finding user:", str(e))
        return {"message": "Error finding user", "error": str(e)}, 500


@profile_bp.route("/add_to_block_list", methods=["POST"])
@jwt_required()
def add_to_block_list():
    try:
        blocked_user_id = request.json.get("blockedUserID")
        current_user_id = get_jwt_identity()
        if blocked_user_id == current_user_id:
            return {"message": "Users cannot block themselves"}, 400

        result = mongo.db.users.update_one(
            {"_id": ObjectId(current_user_id)},
            {"$addToSet": {"block_list": blocked_user_id}},
        )

        if result.modified_count == 0:
            return {"message": "User not found or already blocked"}, 400

        return {"message": f"Successfully blocked user {blocked_user_id}"}, 200

    except Exception as e:
        print("Error blocking user:", str(e))
        return {"message": "Error blocking user", "error": str(e)}, 500


@profile_bp.route("/remove_from_block_list", methods=["POST"])
@jwt_required()
def remove_from_block_list():
    try:
        blocked_user_id = request.json.get("blockedUserID")
        current_user_id = get_jwt_identity()
        if blocked_user_id == current_user_id:
            return {"message": "Users cannot unblock themselves"}, 400

        print(blocked_user_id)
        print(current_user_id)

        result = mongo.db.users.update_one(
            {"_id": ObjectId(current_user_id)},
            {"$pull": {"block_list": blocked_user_id}},
        )

        if result.modified_count == 0:
            return {"message": "User not found or already unblocked"}, 400

        return {"message": f"Successfully unblocked user {blocked_user_id}"}, 200

    except Exception as e:
        print("Error unblocking user:", str(e))
        return {"message": "Error unblocking user", "error": str(e)}, 500


@profile_bp.route("/get_block_list", methods=["GET"])
@jwt_required()
def get_block_list():
    try:
        user_id = get_jwt_identity()
        user = User.find_user_by_id(user_id)
        ret = {}

        blocked_users = user.get("block_list", [])
        blocking_users = []

        user_cursor = mongo.db.users.find({})
        for other_user in user_cursor:
            if user_id in other_user.get("block_list", []):
                blocking_users.append(str(other_user["_id"]))

        all_blocked = list(set(blocked_users + blocking_users))

        ret["blocked"] = blocked_users
        ret["blocking"] = blocking_users
        ret["all_block"] = all_blocked

        return ret, 200
    except Exception as e:
        print("Error finding user:", str(e))
        return {"message": "Error finding user", "error": str(e)}, 500


@profile_bp.route("/get_pinned", methods=["GET"])
@jwt_required()
def get_pinned():
    try:
        user_id = get_jwt_identity()
        pinned_posts = User.get_pinned(user_id)
        print("pinned:", pinned_posts)
        if not pinned_posts:
            return {"message": "Error getting pinned posts"}, 500
        return {
            "message": "Got pinned posts successfully",
            "pinned_posts": pinned_posts,
        }, 200
    except Exception as e:
        print("Error getting pinned posts:", str(e))
        return {"message": "Error getting pinned posts", "error:": str(e)}, 500


@profile_bp.route("/preferences", methods=["GET"])
@jwt_required()
def get_preferences():
    """
    Fetch the currently saved preferences for the logged-in user.
    """
    try:
        user_id = get_jwt_identity()
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"preferences": 1})
        prefs = user.get("preferences", {})
        return (
            jsonify(
                {
                    "open_to_connect": prefs.get("open_to_connect", False),
                    "share_info": prefs.get("share_info", False),
                    "skills": prefs.get("skills", []),
                }
            ),
            200,
        )
    except Exception as e:
        print("Error fetching preferences:", e)
        return {"message": "Error fetching preferences", "error": str(e)}, 500


@profile_bp.route("/preferences", methods=["POST"])
@jwt_required()
def set_preferences():
    """
    Update the user's preferences: open_to_connect, share_info, and list of skills.
    """
    try:
        user_id = get_jwt_identity()
        body = request.get_json() or {}

        # extract and validate
        open_to_connect = bool(body.get("open_to_connect", False))
        share_info = bool(body.get("share_info", False))
        skills = body.get("skills", [])
        if not isinstance(skills, list) or any(not isinstance(s, str) for s in skills):
            return {"message": "`skills` must be a list of strings"}, 400

        # write under a "preferences" sub-document
        result = mongo.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "preferences.open_to_connect": open_to_connect,
                    "preferences.share_info": share_info,
                    "preferences.skills": skills,
                }
            },
        )

        if result.matched_count == 0:
            return {"message": "User not found"}, 404

        return {"message": "Preferences updated successfully"}, 201

    except Exception as e:
        print("Error setting preferences:", e)
        return {"message": "Error setting preferences", "error": str(e)}, 500


@profile_bp.route("/analytics", methods=["GET"])
def get_user_analytics():
    """Get analytics data for a user, including rating, number of posts, comments, and connections"""
    try:
        # Get either userId or username from query parameters
        user_id = request.args.get("userId")
        username = request.args.get("username")

        if not user_id and not username:
            return {"message": "Either userId or username is required"}, 400

        # Find the user
        user = None
        if user_id:
            try:
                # First try to find the user as is (it might already be an ObjectId string)
                user = User.find_user_by_id(user_id)
                if not user:
                    return {"message": "User not found with provided ID"}, 404
                user_id = str(user["_id"])
            except Exception as e:
                print(f"Error finding user by ID: {str(e)}")
                return {"message": "Invalid user ID format or user not found"}, 400
        elif username:
            user = mongo.db.users.find_one({"username": username})
            if not user:
                return {"message": "User not found with provided username"}, 404
            user_id = str(user["_id"])

        # Count posts - safely convert to ObjectId
        try:
            post_count = mongo.db.posts.count_documents(
                {"author_id": ObjectId(user_id)}
            )
        except Exception:
            # If conversion fails, try as string
            post_count = mongo.db.posts.count_documents({"author_id": user_id})

        # Count comments - safely convert to ObjectId
        try:
            comment_count = mongo.db.comments.count_documents(
                {
                    "author_id": ObjectId(user_id),
                    "anonymous": False,  # Only count non-anonymous comments
                }
            )
        except Exception:
            # If conversion fails, try as string
            comment_count = mongo.db.comments.count_documents(
                {"author_id": user_id, "anonymous": False}
            )        # Count connections - safely convert to ObjectId
        try:
            connection_count = mongo.db.mentorships.count_documents(
                {
                    "pending": False,  # Only count active mentorships, not pending requests
                    "$or": [{"mentor": ObjectId(user_id)}, {"mentee": ObjectId(user_id)}]
                }
            )
        except Exception:
            # If conversion fails, try as string
            connection_count = mongo.db.mentorships.count_documents(
                {
                    "pending": False,  # Only count active mentorships, not pending requests
                    "$or": [{"mentor": user_id}, {"mentee": user_id}]
                }
            )

        # Calculate helpfulness rating
        # First, get all the user's comment IDs
        try:
            user_comments = list(
        mongo.db.comments.find({"author_id": ObjectId(user_id), "anonymous": False}, {"_id": 1})
        )
        except Exception:
            user_comments = list(
            mongo.db.comments.find({"author_id": user_id, "anonymous": False}, {"_id": 1})
        )

        comment_ids = [comment["_id"] for comment in user_comments]

        # Count helpful marks more efficiently
        helpful_count = 0
        unhelpful_count = 0

        if comment_ids:
            helpful_count = mongo.db.comment_marks.count_documents(
                {"comment_id": {"$in": comment_ids}, "helpful": True}
            )

            unhelpful_count = mongo.db.comment_marks.count_documents(
                {"comment_id": {"$in": comment_ids}, "helpful": False}
            )
        # Calculate rating as percentage of helpful marks
        total_marks = helpful_count + unhelpful_count
        helpfulness_rating = 0
        if total_marks > 0:
            helpfulness_rating = (helpful_count / total_marks) * 100

        analytics = {
            "post_count": post_count,
            "comment_count": comment_count,
            "connection_count": connection_count,
            "helpful_count": helpful_count,
            "unhelpful_count": unhelpful_count,
            "total_marks": total_marks,
            "helpfulness_rating": round(helpfulness_rating, 1),
            "is_new_user": total_marks
            < 5,  # Flag to identify new users with few ratings
        }

        # Use jsonify to properly serialize the response
        from flask import jsonify

        return jsonify(analytics)

    except Exception as e:
        print("Error getting user analytics:", str(e))
        error_response = {"message": "Error getting user analytics", "error": str(e)}
        from flask import jsonify

        return jsonify(error_response), 500
