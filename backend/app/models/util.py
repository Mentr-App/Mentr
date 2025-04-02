from datetime import datetime
from bson import ObjectId
from app.database import mongo
from app.extensions import img_handler

class Util:
    @staticmethod
    def get_deleted_author_object():
        author = {
            "_id": {"$oid": "[deleted]"},
            "userType": "Mentor",
            "username": "[deleted]",
            "profile_picture": None,
            "major": "[deleted]",
            "company": "[deleted]",
            "industry": "[deleted]"
        }
        return author