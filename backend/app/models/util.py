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
    
    @staticmethod
    def get_anonymous_author_object():
        return {
            "_id": None,
            "username": "Anonymous User",
            "profile_picture_url": None,
            "userType": None,
            "major": None,
            "company": None,
            "industry": None
        }
