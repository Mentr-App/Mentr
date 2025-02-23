from datetime import datetime
from bson import ObjectId, json_util
from app import mongo
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)
import json

class Feed:
    """Feed model for handling Feed-related operations in MongoDB."""

    @staticmethod
    def get_feed(skip=0, limit=10, sort_by="new"):
        """Fetch Feeds for the user feed with pagination and sorting."""
        sort_options = {
            "new": [("created_at", -1)],  # Newest Feeds first
            "top": [("upvotes", -1)],  # Most upvoted Feeds first
            "hot": [("comments", -1), ("upvotes", -1)],  # Most discussed Feeds
        }
        posts = list(mongo.db.posts.find().sort(sort_options.get(sort_by, [("created_at", -1)])).skip(skip).limit(limit))
        json_posts = json.loads(json_util.dumps(posts, json_options=json_util.RELAXED_JSON_OPTIONS))
        return json_posts
