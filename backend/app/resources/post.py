from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from flask import request
from flask_restful import Resource
from app.models.post import Post

class PostResource(Resource):
    """Handles post creation."""

    @jwt_required()  # Protect this route
    def post(self):
        """Create a new post."""
        # Get user (from the JWT token)
        current_user_id = current_user["_id"]
        print(current_user)

        # Get post data from request
        title = request.json.get("title")
        content = request.json.get("content")

        if not title or not content:
            return {"message": "Title and content are required"}, 400

        # Create the post in the database
        print("here")
        post_id = Post.create_post(current_user_id, title, content)
        print("here too")
        return {"message": "Post created successfully", "post_id": post_id}, 201
