from datetime import datetime
from bson import ObjectId, json_util
from app.database import mongo
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)
from app.extensions import img_handler
import json

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

        if not post["author_id"]:
            author = {"_id": "deleted", "username": "[deleted]"}
            post["author_id"] = {"oid": None}

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

        post = mongo.db.posts.find_one(
            {"_id": ObjectId(post_id)}
        )

        if not post:
            return None

        author = mongo.db.users.find_one({"_id": post["author_id"]})
        if not author or not post["author_id"]:
            author = {
                "_id": "deleted",
                "username": "[deleted]"
            }
            post["author_id"] = {"oid": None}
        
        post["author"] = author
        post["created_at"] = post["created_at"].isoformat() if "created_at" in post else None
        return post        

    
    @staticmethod
    def delete_post(post_id):
        mongo.db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {
                "author_id": None
            }}
        )

        post = mongo.db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            return None
        
        author = mongo.db.users.find_one({"_id": post["author_id"]}, {"username": 1, "_id": 1})
        if not author:
            author = {"_id": "deleted", "username": "Anonymous"}
        
        if not post["author_id"]:
            author = {"_id": "deleted", "username": "[deleted]"}
            post["author_id"] = {"oid": None}


        post["author"] = author
        post["created_at"] = post["created_at"].isoformat() if "created_at" in post else None
        return post



    @staticmethod
    def add_comment(post_id, user_id, content):
        comment_data = {
            "author_id": ObjectId(user_id),
            "post_id": ObjectId(post_id),
            "content": content,
            "created_at": datetime.now()
        }
        
        result = mongo.db.comments.insert_one(comment_data).inserted_id
        comment = mongo.db.comments.find_one({"_id": ObjectId(result)})
        if not comment:
            return None
        
        mongo.db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {
                "comments": 1
            }}
        )
        
        author = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"username": 1})
        comment["author"] = author
        comment["created_at"] = comment["created_at"].isoformat()
        return comment

    @staticmethod
    def get_comments(post_id):
        comments = mongo.db.comments.aggregate([
            {"$match": {"post_id": ObjectId(post_id)}},  # Filter by post ID
            {"$sort": {"created_at": -1}},  # Sort by time (newest first)
            {
                "$lookup": {
                    "from": "users",  # Join with 'users' collection
                    "localField": "author_id",  # Field in 'comments'
                    "foreignField": "_id",  # Corresponding field in 'users'
                    "as": "author"
                }
            },
            {"$unwind": {"path": "$author", "preserveNullAndEmptyArrays": True}},  # Convert author array to object
            {
                "$project": {
                    "_id": 1,  # Keep comment ID
                    "post_id": 1,  # Keep post ID
                    "content": 1,  # Keep content
                    "created_at": 1,  # Keep timestamp
                    "author._id": 1,  # Keep only selected fields from 'author'
                    "author.userType": 1,
                    "author.username": 1,
                    "author.profile_picture": 1
                }
            }
        ])

        if not comments:
            return []
        
        comments = list(comments)

        for comment in comments:
            if "created_at" in comment:
                comment["created_at"] = comment["created_at"].isoformat()
                
        return comments

    @staticmethod
    def get_posts_by_author(author_id):
        """
        Retrieves all posts by a specific author from the database
        """
        try:
            author = mongo.db.users.find_one(
                {"_id": ObjectId(author_id)},
                {"username": 1, "_id": 1}
            )
            
            if not author:
                author = {'_id': 'deleted', 'username': 'Anonymous'}
            
            posts_cursor = mongo.db.posts.find({"author_id": ObjectId(author_id)})
            
            posts = []
            for post in posts_cursor:
                post['_id'] = str(post['_id'])
                post['author_id'] = str(post['author_id'])
                
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
    def get_comments_by_author(author_id):
        """
        Retrieves all comments by a specific author from the database
        """
        try:
            author = mongo.db.users.find_one(
                {"_id": ObjectId(author_id)},
                {"username": 1, "_id": 1}
            )
            if not author:
                author = {'_id': 'deleted', 'username': 'Anonymous'}
            
            posts_cursor = mongo.db.posts.find({
                "comments_list.author_id": ObjectId(author_id)
            })
            
            comments = []
            for post in posts_cursor:
                post_id = str(post['_id'])
                for comment in post.get('comments_list', []):
                    if str(comment['author_id']) == author_id:
                        formatted_comment = {
                            '_id': str(comment.get('_id', '')),
                            'content': comment['content'],
                            'author': author['username'],
                            'author_id': {'$oid': author_id},
                            'created_at': comment['created_at']['$date'].isoformat() if isinstance(comment['created_at'], dict) else comment['created_at'].isoformat(),
                            'post_id': post_id
                        }
                        comments.append(formatted_comment)
            comments.sort(key=lambda x: x['created_at'], reverse=True)
            
            return comments
            
        except Exception as e:
            print(f"Error fetching comments by author: {e}")
            return []
