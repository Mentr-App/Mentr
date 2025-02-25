from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from flask import request, Blueprint
from flask_restful import Resource
from app.models.post import Post
from bson import ObjectId
from app.database import mongo

post_bp = Blueprint("post", __name__)


@post_bp.route("/", methods=["POST"])
@jwt_required()
def create_post():
    """Create a new post."""
    try:
        print("Request received:", request.json)
        title = request.json.get("title")
        content = request.json.get("content")
        author_id = get_jwt_identity()
        print(
            "Parsed data:", {"title": title, "content": content, "author_id": author_id}
        )

        if not title or not content:
            return {"message": "Missing title or content"}, 400

        post_id = Post.create_post(author_id, title, content)
        print("Post created with ID:", post_id)
        return {"message": "Post created successfully", "post_id": post_id}, 201
    except Exception as e:
        print("Error creating post:", str(e))
        return {"message": "Error creating post", "error": str(e)}, 500


@post_bp.route("/<post_id>/vote", methods=["POST"])
@jwt_required()
def vote_post(post_id):
    """Upvote or downvote a post."""
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


@post_bp.route("/<post_id>/vote", methods=["GET"])
@jwt_required()
def check_vote(post_id):
    """Check if current user has voted on a post."""
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
