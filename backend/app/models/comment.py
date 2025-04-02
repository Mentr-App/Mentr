from datetime import datetime
from bson import ObjectId
from app.database import mongo
from app.extensions import img_handler

class Comment:
    @staticmethod
    def edit_comment(comment_id, content):
        mongo.db.comments.update_one(
            {"_id": ObjectId(comment_id)},
            {"$set": {
                "content": content
            }}
        )

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

        # If comment exists, fix the access to the 'author' field.
        if comment:
            comment = list(comment)[0]
            # Use dictionary access for 'author' field.
            comment["profile_picture_url"] = img_handler.get(comment["author"]["profile_picture"])
            return comment
        return None
    
    @staticmethod
    def delete_comment(comment_id):
        mongo.db.comments.update_one(
            {"_id": ObjectId(comment_id)},
            {"$set": {
                "author_id": None
            }}
        )

        comment = mongo.db.comments.find_one(
            {"_id": ObjectId(comment_id)}
        )

        if not comment:
            return None
        
        return comment