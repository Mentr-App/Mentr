from flask import request, Blueprint
from bson.json_util import dumps
from app.database import mongo

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
