from datetime import datetime
from bson import ObjectId, json_util
from app import mongo
from flask_jwt_extended import jwt_required, get_jwt_identity
import json


class Feed:
    """Feed model for handling Feed-related operations in MongoDB."""

    @staticmethod
    def get_feed(skip=0, limit=25, sort_by="new"):
        """Fetch Feeds for the user feed with pagination and sorting."""
        
        # Sorting options
        sort_options = {
            "new": [("created_at", -1)],  # Newest first
            "old": [("created_at", 1)],   # Oldest first
            "top": [("upvotes", -1)],     # Most upvotes
            "hot": [("comments", -1), ("upvotes", -1)],  # Most comments, then most upvotes
            "controversial": [("downvotes", -1)],  # Most downvotes
        }

        # Check if sort_by is valid, otherwise fall back to default "new"
        if sort_by not in sort_options:
            print(f"Invalid sort_by value: {sort_by}, defaulting to 'new'")
            sort_by = "new"

        # MongoDB pipeline
        pipeline = [
            {"$sort": dict(sort_options[sort_by])},  # Apply the sorting
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

        # Fetch posts using aggregation
        posts = list(mongo.db.posts.aggregate(pipeline))
        json_posts = json.loads(
            json_util.dumps(posts, json_options=json_util.RELAXED_JSON_OPTIONS)
        )
        return json_posts
