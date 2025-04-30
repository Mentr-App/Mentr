from datetime import datetime
from bson import ObjectId
from app.database import mongo
from app.extensions import img_handler
from app.models.util import Util

class Comment:    
    def get_comment(comment_id, user_id=None):
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
                    "anonymous": 1,  # Keep anonymous flag
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
            }        ])

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
        if user_id:
            user_mark = mongo.db.comment_marks.find_one({
                "comment_id": ObjectId(comment_id),
                "user_id": ObjectId(user_id)
            })
            
            if user_mark:
                comment["user_mark"] = "helpful" if user_mark["helpful"] else "unhelpful"
            else:
                comment["user_mark"] = None

        return comment

    @staticmethod
    def edit_comment(comment_id, content, user_id=None):
        mongo.db.comments.update_one(
            {"_id": ObjectId(comment_id)},
            {"$set": {
                "content": content
            }}
        )

        comment = Comment.get_comment(comment_id, user_id)
        return comment
    @staticmethod
    def delete_comment(comment_id):
        post_id = Comment.get_comment(comment_id)["post_id"]
        mongo.db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"comments": -1}}
        )
        result = mongo.db.comments.delete_one({"_id": ObjectId(comment_id)})
        return result.deleted_count > 0
    
    @staticmethod
    def mark_comment(comment_id, user_id, helpful):
        """
        Marks a comment as helpful or unhelpful.
        
        Args:
            comment_id (str): The ID of the comment to mark
            user_id (str): The ID of the user marking the comment
            helpful (bool): True if marking as helpful, False if marking as unhelpful
            
        Returns:
            dict: The updated comment object, or None if the comment doesn't exist
        """
        # First remove any existing mark from this user on this comment
        mongo.db.comment_marks.delete_one({
            "comment_id": ObjectId(comment_id),
            "user_id": ObjectId(user_id)
        })
        
        # Then add the new mark
        mark_data = {
            "comment_id": ObjectId(comment_id),
            "user_id": ObjectId(user_id),
            "helpful": helpful,
            "created_at": datetime.now()
        }
        
        mongo.db.comment_marks.insert_one(mark_data)
        
        # Get the updated comment
        comment = Comment.get_comment(comment_id, user_id)
        return comment

    @staticmethod
    def add_comment(post_id, user_id, content, anonymous):
        comment_data = {
            "author_id": ObjectId(user_id),
            "post_id": ObjectId(post_id),
            "content": content,
            "created_at": datetime.now(),
            "anonymous": anonymous
        }
        
        comment_id = mongo.db.comments.insert_one(comment_data).inserted_id
        comment = Comment.get_comment(comment_id)
        if not comment:
            return None
        
        mongo.db.posts.update_one(
            {"_id": ObjectId(post_id)},            {"$inc": {
                "comments": 1
            }}
        )
        
        return comment
        
    @staticmethod
    def get_comments(post_id, user_id=None):
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
                    "anonymous": 1,  # Keep anonymous status
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
            
            # Add user mark status if user_id is provided
            if user_id:
                user_mark = mongo.db.comment_marks.find_one({
                    "comment_id": comment["_id"],
                    "user_id": ObjectId(user_id)
                })
                
                if user_mark:
                    comment["user_mark"] = "helpful" if user_mark["helpful"] else "unhelpful"
                else:
                    comment["user_mark"] = None
                
        return comments

    @staticmethod
    def get_comments_by_author(username):
        """
        Retrieves all non-anonymous comments by a specific author from the database
        """
        try:
            author = mongo.db.users.find_one(
                {"username": username},
                {"username": 1, "_id": 1, "userType": 1, "major": 1, "company": 1, "industry": 1}
            )
            if not author:
                return []

            comments_cursor = mongo.db.comments.find({
                "author_id": ObjectId(author["_id"])
            })

            comments = []
            for comment in comments_cursor:
                is_anonymous = comment.get('anonymous', False)

                if is_anonymous:
                    # Skip anonymous comments — we don't show these in the profile
                    continue

                formatted_comment = {
                    '_id': str(comment.get('_id', '')),
                    'content': comment['content'],
                    'author': {
                        '_id': {'$oid': str(author['_id'])},
                        'username': author['username'],
                        'userType': author.get('userType'),
                        'major': author.get('major'),
                        'company': author.get('company'),
                        'industry': author.get('industry')
                    },
                    'anonymous': False,
                    'author_id': {'$oid': str(author["_id"])},
                    'created_at': (
                        comment['created_at']['$date'].isoformat()
                        if isinstance(comment['created_at'], dict)
                        else comment['created_at'].isoformat()
                    ),
                    'post_id': str(comment['post_id'])
                }

                comments.append(formatted_comment)

            comments.sort(key=lambda x: x['created_at'], reverse=True)
            return comments

        except Exception as e:
            print(f"Error fetching comments by author: {e}")
            return []

    @staticmethod
    def mark_comment(comment_id, user_id, helpful):
        """
        Marks a comment as helpful or unhelpful.
        
        Args:
            comment_id (str): The ID of the comment to mark
            user_id (str): The ID of the user marking the comment
            helpful (bool): True if marking as helpful, False if marking as unhelpful
            
        Returns:
            dict: The updated comment object, or None if the comment doesn't exist
        """
        # First remove any existing mark from this user on this comment
        mongo.db.comment_marks.delete_one({
            "comment_id": ObjectId(comment_id),
            "user_id": ObjectId(user_id)
        })
        
        # Then add the new mark
        mark_data = {
            "comment_id": ObjectId(comment_id),
            "user_id": ObjectId(user_id),
            "helpful": helpful,
            "created_at": datetime.now()
        }
        mongo.db.comment_marks.insert_one(mark_data)
        
        # Get the updated comment with user's mark status
        comment = Comment.get_comment(comment_id, user_id)
        
        return comment
