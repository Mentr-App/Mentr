from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from flask import request, Blueprint, current_app
from flask_restful import Resource
from app.models.post import Post
from app.models.comment import Comment
from bson import ObjectId
from app.database import mongo
from app.extensions import img_handler
import time
from werkzeug.utils import secure_filename
import os

post_bp = Blueprint("post", __name__)


@post_bp.route("/", methods=["POST"])
@jwt_required()
def create_post():
    """Create a new post."""
    try:
        title = request.form.get("title")
        content = request.form.get("content")
        author_id = get_jwt_identity()
        anonymous = request.form.get("anonymous", "false").lower() == "true"
        if not title:
            return {"message": "Missing title"}, 400

        image_url = None
        filename = None
        if 'image' in request.files:
            file = request.files['image']
            if file.filename:
                allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
                if not file.filename.lower().rsplit('.', 1)[1] in allowed_extensions:
                    return {"message": "File type not allowed"}, 400

                timestamp = int(time.time() * 1000)
                filename = f"post_images/{author_id}_{timestamp}_{file.filename}"
                img_handler.create(filename, file)

        post_id = Post.create_post(author_id, title, content, filename, anonymous)

        return {"message": "Post created successfully", "post_id": post_id}, 201

    except Exception as e:
        print("Error creating post:", str(e))
        return {"message": "Error creating post", "error": str(e)}, 500


@post_bp.route("/<post_id>", methods=["GET"])
def view_post(post_id):
    try:
        post = Post.view_post(post_id)
        if not post:
            return {"message": "Post not found"}, 404
        
        return {"message": "Post found", "post": post}, 200
    except Exception as e:
        print("Error retrieving post:", str(e))
        return {"message": "Error retrieving post", "error": str(e)}


@post_bp.route("/<post_id>/vote", methods=["POST"])
@jwt_required()
def vote_post(post_id):
    """Upvote or downvote a post."""
    try:
        user_id = get_jwt_identity()
        vote_type = request.json.get("vote_type")  # upvote or downvote

        if vote_type not in ["up", "down"]:
            return {"message": "Invalid vote type"}, 400

        # post exists
        post = mongo.db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            return {"message": "Post not found"}, 404

        if "votes" not in post:
            mongo.db.posts.update_one({"_id": ObjectId(post_id)}, {"$set": {"votes": []}})
            post["votes"] = []

        existing_vote_index = None
        for i, vote in enumerate(post.get("votes", [])):
            if vote.get("user_id") == user_id:
                existing_vote_index = i
                break

        if existing_vote_index is not None:
            existing_vote = post["votes"][existing_vote_index]
            if existing_vote.get("vote_type") == vote_type:
                mongo.db.posts.update_one(
                    {"_id": ObjectId(post_id)},
                    {
                        "$pull": {"votes": {"user_id": user_id}},
                        "$inc": {f"{vote_type}votes": -1},
                    },
                )
                return {
                    "message": f"Removed {vote_type}vote successfully",
                    "vote_type": None,
                    "upvotes": post["upvotes"] - (1 if vote_type == "up" else 0),
                    "downvotes": post["downvotes"] - (1 if vote_type == "down" else 0),
                }, 200
            else:
                mongo.db.posts.update_one(
                    {"_id": ObjectId(post_id), "votes.user_id": user_id},
                    {
                        "$set": {"votes.$.vote_type": vote_type},
                        "$inc": {
                            f"{vote_type}votes": 1,
                            f"{'down' if vote_type == 'up' else 'up'}votes": -1,
                        },
                    },
                )
                return {
                    "message": f"Changed vote to {vote_type}vote successfully",
                    "vote_type": vote_type,
                    "upvotes": post["upvotes"] + (1 if vote_type == "up" else -1),
                    "downvotes": post["downvotes"] + (1 if vote_type == "down" else -1),
                }, 200
        else:
            # User hasn't voted on this post yet
            mongo.db.posts.update_one(
                {"_id": ObjectId(post_id)},
                {
                    "$push": {"votes": {"user_id": user_id, "vote_type": vote_type}},
                    "$inc": {f"{vote_type}votes": 1},
                },
            )
            return {
                "message": f"Post {vote_type}voted successfully",
                "vote_type": vote_type,
                "upvotes": post["upvotes"] + (1 if vote_type == "up" else 0),
                "downvotes": post["downvotes"] + (1 if vote_type == "down" else 0),
            }, 200
    except Exception as e:
        print("Error voting on post:", str(e))
        return {"message": "Error voting on post", "error": str(e)}


@post_bp.route("/<post_id>/vote", methods=["GET"])
@jwt_required()
def check_vote(post_id):
    """Check if current user has voted on a post."""
    try:
        user_id = get_jwt_identity()

        post = mongo.db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            return {"message": "Post not found"}, 404

        user_vote = None
        for vote in post.get("votes", []):
            if vote.get("user_id") == user_id:
                user_vote = vote
                break

        return {"vote_type": user_vote["vote_type"] if user_vote else None}, 200
    except Exception as e:
        print("Error getting votes on post:", str(e))
        return {"message": "Error getting votes on post", "error": str(e)}


@post_bp.route("/<post_id>/edit", methods=["POST"])
@jwt_required()
def edit_post(post_id):
    """Edit Post with new description"""
    try: 
        content = request.json.get("content")
        if not content:
            return {"message": "Content is empty"}, 400

        post = Post.edit_post(post_id, content)
        if not post:
            return {"message": "Failed to edit post"}, 500

        return {"message": "Post updated successfully", "post": post}, 200

    except Exception as e:
        print("Error editing post:", str(e))
        return {"message": "Error editing content on post", "error" : str(e)}

      
@post_bp.route("/<post_id>/comments", methods=["GET"])
def get_post_comments(post_id):
    """Get all comments for a post."""
    try:
        comments = Comment.get_comments(post_id)
        return {"comments": comments}, 200
    except Exception as e:
        print("Error retrieving comments:", str(e))
        return {"message": "Error retrieving comments", "error": str(e)}, 500

      
@post_bp.route("/<post_id>/comments", methods=["POST"])
@jwt_required()
def add_comment(post_id):
    """Add a comment to a post."""
    try:
        user_id = get_jwt_identity()
        content = request.json.get("content")
        anonymous = request.json.get("anonymous", False)
        
        if not content:
            return {"message": "Comment content cannot be empty"}, 400
        
        post = mongo.db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            return {"message": "Post cannot be found"}, 404
            
        comment = Comment.add_comment(post_id, user_id, content, anonymous)
        
        if not comment:
            return {"message": "Failed to add comment"}, 500
            
        return {"message": "Comment added successfully", "comment": comment}, 201
    except Exception as e:
        print("Error adding comment:", str(e))
        return {"message": "Error adding comment", "error": str(e)}, 500

@post_bp.route("/<post_id>/delete", methods=["POST"])
@jwt_required()
def delete_post(post_id):
    try:
        post = Post.delete_post(post_id)
        if not post:
            return {"message": "Failed to delete post"}, 500
        return {"message": "Post deleted successfully", "post": post}, 200

    except Exception as e:
        print("Error deleting post:", str(e))
        return {"message": "Error deleting post"}, 500

@post_bp.route("/<post_id>/pin", methods=["POST"])
@jwt_required()
def pin_post(post_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return {"message": "user_id not found"}, 404
        
        user = Post.pin_post(post_id, user_id)
        if not user:
            return {"message": "Failed to pin post"}, 500
        return {"message": "Post pinned successfully", "user": user}, 200
    except Exception as e:
        print("Error pinning post:", str(e))
        return {"message": "Error pinning post"}, 500

@post_bp.route("/<post_id>/unpin", methods=["POST"])
@jwt_required()
def unpin_post(post_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return {"message": "user_id not found"}, 404
        
        user = Post.pin_post(post_id, user_id, pin=False)
        if not user:
            return {"message": "Failed to unpin post"}, 500
        return {"message": "Post unpinned successfully", "user": user}, 200
    except Exception as e:
        print("Error unpinning post:", str(e))
        return {"message": "Error unpinning post"}, 500