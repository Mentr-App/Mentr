from flask import request, Blueprint
from bson import ObjectId
from app.database import mongo

saved_post_bp = Blueprint("saved_post", __name__)

@saved_post_bp.route("/", methods=["POST"])
def save_post():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        post_id = data.get("postId")

        if not user_id or not post_id:
            return {"message": "userId and postId are required"}, 400

        # Avoid duplicates
        existing = mongo.db.savedposts.find_one({
            "userId": ObjectId(user_id),
            "postId": ObjectId(post_id)
        })
        if existing:
            return {"message": "Post already saved"}, 200

        mongo.db.savedposts.insert_one({
            "userId": ObjectId(user_id),
            "postId": ObjectId(post_id)
        })

        return {"message": "Post saved successfully"}, 200

    except Exception as e:
        return {"message": "Error saving post", "error": str(e)}, 500

@saved_post_bp.route("/get/", methods=["GET"])
def get_saved_posts():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return {"message": "userId is required"}, 400

        saved_entries = mongo.db.savedposts.find({"userId": ObjectId(user_id)})

        # Extract post IDs
        post_ids = [entry["postId"] for entry in saved_entries]

        # Fetch actual posts from the posts collection
        posts = list(mongo.db.posts.find({"_id": {"$in": post_ids}}))

        for post in posts:
            post["_id"] = str(post["_id"])
            if "author" in post and "_id" in post["author"]:
                post["author"]["_id"] = str(post["author"]["_id"])

        return {"savedPosts": posts}, 200

    except Exception as e:
        return {"message": "Error retrieving saved posts", "error": str(e)}, 500


    
@saved_post_bp.route("/unsave/", methods=["DELETE"])
def unsave_post():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        post_id = data.get("postId")
        print(f"Received unsave request: userId={user_id}, postId={post_id}")

        if not user_id or not post_id:
            return {"message": "userId and postId are required"}, 400

        result = mongo.db.savedposts.delete_one({
            "userId": ObjectId(user_id),
            "postId": ObjectId(post_id)
        })

        if result.deleted_count == 0:
            return {"message": "No saved post found to delete"}, 404

        return {"message": "Post unsaved successfully"}, 200

    except Exception as e:
        return {"message": "Error unsaving post", "error": str(e)}, 500
