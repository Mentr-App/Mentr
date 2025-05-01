from flask import request, Blueprint
from bson import ObjectId
from bson.json_util import dumps
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.database import mongo
from datetime import datetime, timezone

match_bp = Blueprint("match", __name__)

@match_bp.route("/get_matches", methods=["GET"])
@jwt_required()
def get_matchable_users():
    try:
        current_user_id = get_jwt_identity()
        # Load current user's skills
        current_user = mongo.db.users.find_one({"_id": ObjectId(current_user_id)})
        current_skills = []
        if current_user and isinstance(current_user.get("preferences"), dict):
            current_skills = current_user["preferences"].get("skills", []) or []

        # Find users who are open to connect or have no preferences
        query = {
            "$or": [
                {"preferences.open_to_connect": True},
                {"preferences": {"$exists": False}}
            ]
        }
        users_cursor = mongo.db.users.find(query)
        users = list(users_cursor)

        # Compute similarity score and sort
        def similarity(user):
            user_skills = []
            prefs = user.get("preferences")
            if isinstance(prefs, dict):
                user_skills = prefs.get("skills", []) or []
            # count intersection
            return len(set(current_skills) & set(user_skills))

        users.sort(key=similarity, reverse=True)

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
            "requestedAt": datetime.now(timezone.utc)
        })

        return {"message": "Mentorship request sent", "alreadyExists": False}, 200

    except Exception as e:
        print(f"Error requesting mentorship: {e}")
        return {"message": "Internal Server Error", "error": str(e)}, 500

@match_bp.route("/pending", methods=["GET"])
def get_pending_requests():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return {"message": "Missing userId"}, 400

        oid = ObjectId(user_id)

        requests = list(mongo.db.mentorships.find({
            "pending": True,
            "$or": [
                {"mentor": oid},
                {"mentee": oid}
            ]
        }))

        return dumps(requests), 200
    except Exception as e:
        print(f"Error fetching pending requests: {e}")
        return {"message": "Internal Server Error", "error": str(e)}, 500


@match_bp.route("/respond", methods=["POST"])
def respond_to_request():
    try:
        data = request.get_json()
        req_id = data.get("id")
        action = data.get("action")

        if not req_id or action not in ["accept", "reject"]:
            return {"message": "Invalid input"}, 400
            
        # Get the mentorship details to know which users are involved
        mentorship = mongo.db.mentorships.find_one({"_id": ObjectId(req_id)})
        if not mentorship:
            return {"message": "Mentorship not found"}, 404
            
        mentor_id = mentorship.get("mentor")
        mentee_id = mentorship.get("mentee")

        if action == "accept":
            mongo.db.mentorships.update_one(
                {"_id": ObjectId(req_id)},
                {
                    "$set": {
                        "pending": False,
                        "created_at": datetime.now(timezone.utc)
                    }
                }
            )
        elif action == "reject":
            mongo.db.mentorships.delete_one({"_id": ObjectId(req_id)})

        return {"message": "Success"}, 200
    except Exception as e:
        print(f"Error responding to request: {e}")
        return {"message": "Internal Server Error", "error": str(e)}, 500
    

@match_bp.route("/current", methods=["GET"])
def get_current_connections():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return {"message": "Missing userId"}, 400

        oid = ObjectId(user_id)

        connections = list(mongo.db.mentorships.find({
            "pending": False,
            "$or": [
                {"mentor": oid},
                {"mentee": oid}
            ]
        }))

        return dumps(connections), 200
    except Exception as e:
        print(f"Error fetching current connections: {e}")
        return {"message": "Internal Server Error", "error": str(e)}, 500
