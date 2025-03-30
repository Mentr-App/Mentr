from datetime import datetime
from bson import ObjectId, json_util
from app import mongo
from flask_jwt_extended import jwt_required, get_jwt_identity
import json


class Feed:
    """Feed model for handling Feed-related operations in MongoDB."""

    @staticmethod
    def get_feed(skip=0, limit=50, sort_by="new"):
        """Fetch Feeds for the user feed with pagination and sorting."""
        sort_options = {
            "new": [("created_at", -1)],
            "top": [("upvotes", -1)],
            "hot": [("comments", -1), ("upvotes", -1)],
        }

        pipeline = [
            {"$sort": dict(sort_options.get(sort_by, [("created_at", -1)]))},
            {"$skip": skip},
            {"$limit": limit},
            {
                "$lookup": {
                    "from": "users",
                    "localField": "author_id",
                    "foreignField": "_id",
                    "as": "author_info",
                }
            },
            {
                "$addFields": {
                    "author": {"$arrayElemAt": ["$author_info.username", 0]},
                    "created_at": {
                        "$dateToString": {
                            "format": "%Y-%m-%dT%H:%M:%S.%LZ",
                            "date": "$created_at",
                        }
                    },
                }
            },
            {"$project": {"author_info": 0}},
        ]

        posts = list(mongo.db.posts.aggregate(pipeline))
        json_posts = json.loads(
            json_util.dumps(posts, json_options=json_util.RELAXED_JSON_OPTIONS)
        )
        return json_posts
