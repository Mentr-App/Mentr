from flask import request, Blueprint
from bson import ObjectId
from bson.json_util import dumps
from app.database import mongo
from datetime import datetime

match_bp = Blueprint("match", __name__)

@match_bp.route("/get_matches", methods=["GET"])
def get_matchable_users():
    try:
        print("Fetching all matchable users...")
        users_cursor = mongo.db.users.find({
            "$or": [
                {"match": True},
                {"match": {"$exists": False}}
            ]
        })

        users = list(users_cursor)
        return dumps(users), 200

    except Exception as e:
        print(f"Error in get_matchable_users: {e}")
        return {"message": "Error retrieving matchable users", "error": str(e)}, 500

@match_bp.route("/request", methods=["POST"])
def request_mentorship():
    try:
        data = request.get_json()
        sender_id = data.get("senderId")
        receiver_id = data.get("receiverId")
        sender_role = data.get("senderRole")

        if not sender_id or not receiver_id or not sender_role:
            return {"message": "Missing fields"}, 400

        sender_oid = ObjectId(sender_id)
        receiver_oid = ObjectId(receiver_id)

        if sender_role == "Mentor":
            mentor_id = sender_oid
            mentee_id = receiver_oid
        else:
            mentor_id = receiver_oid
            mentee_id = sender_oid

        # Check for existing mentor-mentee pairing
        existing = mongo.db.mentorships.find_one({
            "mentor": mentor_id,
            "mentee": mentee_id
        })

        if existing:
            return {"message": "Already requested", "alreadyExists": True}, 200

        mongo.db.mentorships.insert_one({
            "mentor": mentor_id,
            "mentee": mentee_id,
            "receiver": receiver_oid,
            "pending": True,
            "created_at": request.date if hasattr(request, "date") else None,
            "requestedAt": datetime.now(),
        })

        return {"message": "Mentorship request sent", "alreadyExists": False}, 200

    except Exception as e:
        print(f"Error requesting mentorship: {e}")
        return {"message": "Internal Server Error", "error": str(e)}, 500
