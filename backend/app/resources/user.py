from flask_restful import Resource, request
from app.models.user import User

class UserResource(Resource):
    """Handles user-related API routes."""

    def post(self):
        """Create a new user."""
        username = request.json.get("username")
        password = request.json.get("password")

        return User.create_user(username, password)

    def get(self):
        """Retrieve user details by username."""
        #TODO
        username = request.json.get("username")

        user = User.find_user(username)
        if user:
            return user, 200
        return {"message": "User not found"}, 404

    def delete(self):
        """Delete a user by username."""
        username = request.json.get("username")


        return User.delete_user(username)
