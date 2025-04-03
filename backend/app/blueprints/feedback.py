from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from flask import request, Blueprint
from app.models.user import User
from flask_restful import Resource
from bson import ObjectId
from app.database import mongo

feedback_bp = Blueprint("feedback", __name__)

@feedback_bp.route("/", methods=["POST"])
def upload_feedback():
    try:
        data = request.get_json()
        feedback = data.get("feedback")
        name = data.get("name", "Anonymous")
        anonymous = data.get("anonymous", True)
        user_id = data.get("userId")  # This is optional

        entry = {
            "feedback": feedback,
            "name": name,
            "anonymous": anonymous,
        }

        if user_id:
            entry["userId"] = ObjectId(user_id)

        mongo.db.feedback.insert_one(entry)

        return {"message": "Feedback uploaded successfully"}, 200

    except Exception as e:
        return {"message": "Error uploading feedback", "error": str(e)}, 500
