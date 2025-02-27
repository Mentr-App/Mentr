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
        feedback = request.json.get("feedback")
        mongo.db.feedback.insert_one({"feedback": feedback})
        return {"message": "Feedback uploaded successfully"},200
    except Exception as e:
        return {"message": "Error uploading feedback", "error": str(e)}, 500