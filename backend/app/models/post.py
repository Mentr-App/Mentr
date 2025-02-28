from datetime import datetime
from bson import ObjectId
from app.database import mongo
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

class Post:
    """Post model for handling post-related operations in MongoDB."""

    @staticmethod
    def view_post(post_id):
        post = mongo.db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            return None

        author = mongo.db.users.find_one({"_id": post["author_id"]}, {"username": 1, "_id": 1})
        print(author)
        if not author:
            author = {'_id': 'deleted', 'username': 'Anonymous'}

        new_views = post.get("views", 0) + 1
        mongo.db.posts.update_one({"_id": ObjectId(post_id)}, {"$set": {"views": new_views}})

        post["author"] = author
        post["views"] = new_views
        post["created_at"] = post["created_at"].isoformat() if "created_at" in post else None
        return post
        

    @staticmethod
    def create_post(author_id, title, content):
        """Insert a new post into the database."""
        post_data = {
            "author_id": ObjectId(author_id),
            "title": title,
            "content": content,
            "created_at": datetime.utcnow(),
            "upvotes": 0,
            "downvotes": 0,
            "comments": 0
        }
        print("here 3")
        post_id = mongo.db.posts.insert_one(post_data).inserted_id
        return str(post_id)

    @staticmethod
    def get_feed(skip=0, limit=10, sort_by="new"):
        """Fetch posts for the user feed with pagination and sorting."""
        sort_options = {
            "new": [("created_at", -1)],  # Newest posts first
            "top": [("upvotes", -1)],  # Most upvoted posts first
            "hot": [("comments", -1), ("upvotes", -1)],  # Most discussed posts
        }
        posts = mongo.db.posts.find().sort(sort_options.get(sort_by, [("created_at", -1)])).skip(skip).limit(limit)
        return [{"_id": str(post["_id"]), **post} for post in posts]
