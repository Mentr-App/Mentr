from datetime import datetime
from bson import ObjectId
from app.database import mongo
from app.extensions import img_handler
from app.models.post import Post

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
                    "author._id": 1,  # Select only required fields from 'author'
                    "author.userType": 1,
                    "author.username": 1,
                    "author.profile_picture": 1,
                    "author.major": 1,
                    "author.company": 1,
                    "author.industry": 1
                }
            }
        ])

        comment = list(comment)[0]
        if not comment:
            return None
        
        author = comment.get("author", None)
        if author:
            comment["profile_picture_url"] = img_handler.get(comment["author"]["profile_picture"])
        else:
            author = Post.get_deleted_author_object()
        comment["author"] = author

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
        mongo.db.comments.update_one(
            {"_id": ObjectId(comment_id)},
            {"$set": {
                "author_id": None
            }}
        )

        comment = Comment.get_comment(comment_id)
        return comment