from datetime import datetime
from bson import ObjectId, json_util
from app.database import mongo
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)
from app.extensions import img_handler
from app.models.util import Util
import json


class Post:
    """Post model for handling post-related operations in MongoDB."""

    @staticmethod
    def view_post(post_id, inc_view=True):
        post = mongo.db.posts.aggregate([
            {"$match": {"_id": ObjectId(post_id)}},
            {"$lookup": {
                "from": "users",  # Join with 'users' collection
                "localField": "author_id",  # Field in 'comments'
                "foreignField": "_id",  # Corresponding field in 'users'
                "as": "author"
            }},
            {"$unwind": {"path": "$author", "preserveNullAndEmptyArrays": True}},  # Convert author array to object
            {
                "$project": {
                    "_id": 1,  # Keep post ID
                    "title": 1,
                    "content": 1,  # Keep content
                    "image_url": 1,
                    "created_at": 1,  # Keep timestamp
                    "upvotes": 1,
                    "downvotes": 1,
                    "comments": 1,
                    "views": 1,
                    "votes": 1,
                    "author": {
                        "$cond": {
                            "if": {"$gt": ["$author._id", None]},  # If author exists, keep it
                            "then": {
                                "_id": "$author._id",
                                "userType": "$author.userType",
                                "username": "$author.username",
                                "profile_picture": {"$ifNull": ["$author.profile_picture", None]},
                                "major": "$author.major",
                                "company": "$author.company",
                                "industry": "$author.industry"
                            },
                            "else": None  # If author does not exist, set to None (removes field)
                        }
                    }
                }
            }
        ])
        post = list(post)[0]

        if not post:
            return None

        if inc_view:
            result = mongo.db.posts.find_one_and_update(
                {"_id": ObjectId(post_id)},
                {"$inc": {"views": 1}},
                return_document=True
            )
            post["views"] = result["views"] if result else post.get("views", 0) + 1
        
        post["created_at"] = post["created_at"].isoformat() if "created_at" in post else None
        author = post.get("author", None)
        if author:
            if author["profile_picture"]:
                author["profile_picture_url"] = img_handler.get(author["profile_picture"])
                del author["profile_picture"]
        else:
            author = Util.get_deleted_author_object()
        post["author"] = author

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
    def get_total_posts():
        """Get the total number of posts in the database."""
        return mongo.db.posts.count_documents({})
    
    @staticmethod
    def edit_post(post_id, content):
        mongo.db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {
                "content": content
            }}
        )

        post = Post.view_post(post_id, inc_view=False)
        return post if post else None

    
    @staticmethod
    def delete_post(post_id):
        mongo.db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {
                "author_id": None
            }}
        )

        post = Post.view_post(post_id, inc_view=False)
        return post if post else None

    @staticmethod
    def get_posts_by_author(username):
        """
        Retrieves all posts by a specific author from the database
        """
        try:
            author = mongo.db.users.find_one(
                {"username": username},
                {"username": 1, "_id": 1}
            )
            if not author:
                author = {'_id': 'deleted', 'username': 'Anonymous'}
            
            posts_cursor = mongo.db.posts.find({"author_id": ObjectId(author["_id"])})
            
            posts = []
            for post in posts_cursor:
                post['_id'] = str(post['_id'])
                post['author_id'] = str(post['author_id'])
                post['author'] = str(author["username"])
                
                if 'created_at' in post and isinstance(post['created_at'], datetime):
                    post['created_at'] = post['created_at'].isoformat()
                if 'image_url' in post and post['image_url']:
                    post['image_url'] = img_handler.get(post['image_url'].split('?')[0])
                posts.append(post)
            
            json_posts = json.loads(
                json_util.dumps(posts, json_options=json_util.RELAXED_JSON_OPTIONS)
            )
            print(posts)
            print(json_posts)
            return json_posts
            
        except Exception as e:
            print(f"Error fetching posts by author: {e}")
            return []

    @staticmethod
    def pin_post(post_id, user_id, pin=True):
        if pin:
            mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$push": {"pinned_posts": post_id}}
            )
        else:
            mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$pull": {"pinned_posts": post_id}}
            )

        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return None
        return user

