from datetime import datetime
from bson import ObjectId
from app.database import mongo
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)
from app.extensions import img_handler

class Post:
    """Post model for handling post-related operations in MongoDB."""

    @staticmethod
    def view_post(post_id):
        post = mongo.db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            return None

        author = mongo.db.users.find_one({"_id": post["author_id"]}, {"username": 1, "_id": 1})
        if not author:
            author = {'_id': 'deleted', 'username': 'Anonymous'}

        result = mongo.db.posts.find_one_and_update(
            {"_id": ObjectId(post_id)},
            {"$inc": {"views": 1}},
            return_document=True
        )
        
        post["views"] = result["views"] if result else post.get("views", 0) + 1
        post["author"] = author
        post["created_at"] = post["created_at"].isoformat() if "created_at" in post else None

        if "image_url" in post and post["image_url"]:
            post["image_url"] = img_handler.get(post["image_url"].split('?')[0])  # Get fresh signed URL

        return post

    @staticmethod
    def create_post(author_id, title, content, image_url=None):
        """Insert a new post into the database."""
        post_data = {
            "author_id": ObjectId(author_id),
            "title": title,
            "content": content,
            "image_url": image_url,
            "created_at": datetime.now(),
            "upvotes": 0,
            "downvotes": 0,
            "comments": 0
        }
        post_id = mongo.db.posts.insert_one(post_data).inserted_id
        return str(post_id)

    @staticmethod
    def get_feed(skip=0, limit=100, sort_by="new"):
        """Fetch posts for the user feed with pagination and sorting."""
        sort_options = {
            "new": [("created_at", -1)],  # Newest posts first
            "top": [("upvotes", -1)],  # Most upvoted posts first
            "hot": [("comments", -1), ("upvotes", -1)],  # Most discussed posts
        }
        posts = mongo.db.posts.find().sort(sort_options.get(sort_by, [("created_at", -1)])).skip(skip).limit(limit)
        return [{"_id": str(post["_id"]), **post} for post in posts]
    
    @staticmethod
    def get_total_posts():
        """Get the total number of posts in the database."""
        return mongo.db.posts.count_documents({})

    @staticmethod
    def add_comment(post_id, user_id, content):
        """Add a comment to a post."""
        comment = {
            "author_id": ObjectId(user_id),
            "content": content,
            "created_at": datetime.now()
        }
        
        # Add the comment to the post's comments array
        result = mongo.db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {
                "$push": {"comments_list": comment},
                "$inc": {"comments": 1}  # Increment comment count
            }
        )
        
        if result.modified_count == 0:
            return None
            
        # Get the updated post to return the updated comments list
        post = mongo.db.posts.find_one({"_id": ObjectId(post_id)})
        
        # Get author info for the comment
        author = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"username": 1})
        latest_comment = post.get("comments_list", [])[-1]
        latest_comment["author"] = author
        latest_comment["created_at"] = latest_comment["created_at"].isoformat()
        
        return latest_comment
        
    @staticmethod
    def get_comments(post_id):
        """Get all comments for a post with author information."""
        post = mongo.db.posts.find_one({"_id": ObjectId(post_id)})
        
        if not post or "comments_list" not in post:
            return []
            
        comments = post["comments_list"]
        
        # Add author information to each comment
        for comment in comments:
            if "author_id" in comment:
                author = mongo.db.users.find_one({"_id": comment["author_id"]}, {"username": 1})
                comment["author"] = author["username"] if author else "Anonymous"
            else:
                comment["author"] = "Anonymous"
                
            # Format dates
            if "created_at" in comment:
                comment["created_at"] = comment["created_at"].isoformat()
                
        return comments
