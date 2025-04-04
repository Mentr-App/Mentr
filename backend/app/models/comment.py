from datetime import datetime
from bson import ObjectId
from app.database import mongo
from app.extensions import img_handler
from app.models.util import Util

class Comment:
    def get_comment(comment_id):
        comment = mongo.db.comments.aggregate([
            {"$match": {"_id": ObjectId(comment_id)}},  # Match the specific comment
            {
                "$lookup": {
                    "from": "users",  # Join with the 'users' collection
                    "localField": "author_id",  # Field in 'comments'
                    "foreignField": "_id",  # Corresponding field in 'users'
                    "as": "author"
                }
            },
            {"$unwind": {"path": "$author", "preserveNullAndEmptyArrays": True}}, # Convert author array to an object
            {
                "$project": {
                    "_id": 1,  # Keep comment ID
                    "post_id": 1,  # Keep post ID
                    "content": 1,  # Keep content
                    "created_at": 1,  # Keep timestamp
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
                            "else": None  # If author does not exist, set it to None
                        }
                    }
                }
            }
        ])

        comment = list(comment)[0]
        if not comment:
            return None
        
        author = comment.get("author", None)
        print("author:", author)
        if author:
            if author["profile_picture"]:
                comment["profile_picture_url"] = img_handler.get(comment["author"]["profile_picture"])
                del author["profile_picture"]
        else:
            author = Util.get_deleted_author_object()
        comment["author"] = author
        comment["created_at"] = comment["created_at"].isoformat()

        return comment

    @staticmethod
    def edit_comment(comment_id, content):
        mongo.db.comments.update_one(
            {"_id": ObjectId(comment_id)},
            {"$set": {
                "content": content
            }}
        )

        comment = Comment.get_comment(comment_id)
        return comment
    
    @staticmethod
    def delete_comment(comment_id):
        result = mongo.db.comments.delete_one({"_id": ObjectId(comment_id)})
        return result.deleted_count > 0

    @staticmethod
    def add_comment(post_id, user_id, content):
        comment_data = {
            "author_id": ObjectId(user_id),
            "post_id": ObjectId(post_id),
            "content": content,
            "created_at": datetime.now()
        }
        
        comment_id = mongo.db.comments.insert_one(comment_data).inserted_id
        comment = Comment.get_comment(comment_id)
        if not comment:
            return None
        
        mongo.db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {
                "comments": 1
            }}
        )

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
                            "else": None  # If author does not exist, set it to None
                        }
                    }
                }
            }
        ])

        if not comments:
            return []
        
        comments = list(comments)

        for comment in comments:
            if "created_at" in comment:
                comment["created_at"] = comment["created_at"].isoformat()
            author = comment.get("author", None)
            if author:
                if author["profile_picture"]:
                    comment["profile_picture_url"] = img_handler.get(comment["author"]["profile_picture"])
                    del author["profile_picture"]
            else:
                author = Util.get_deleted_author_object()
            comment["author"] = author
                
        return comments

    @staticmethod
    def get_comments_by_author(username):
        """
        Retrieves all comments by a specific author from the database
        """
        try:
            author = mongo.db.users.find_one(
                {"username": username},
                {"username": 1, "_id": 1}
            )
            if not author:
                author = {'_id': 'deleted', 'username': 'Anonymous'}
            
            comments_cursor = mongo.db.comments.find({
                "author_id": ObjectId(author["_id"])
            })
            
            comments = []
            for comment in comments_cursor:
                formatted_comment = {
                    '_id': str(comment.get('_id', '')),
                    'content': comment['content'],
                    'author': author['username'],
                    'author_id': {'$oid': author["_id"]},
                    'created_at': comment['created_at']['$date'].isoformat() if isinstance(comment['created_at'], dict) else comment['created_at'].isoformat(),
                    'post_id': str(comment['post_id'])
                }
                comments.append(formatted_comment)
            comments.sort(key=lambda x: x['created_at'], reverse=True)
            
            return comments
            
        except Exception as e:
            print(f"Error fetching comments by author: {e}")
            return []
