from flask import request
from flask_restful import Resource
from app.models.user import User
from app.database import bcrypt
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt_identity
)



class AuthResource(Resource):
    """Handles user authentication"""

    def post(self):
        """Login a user and generate a JWT token."""
        username = request.json.get("username")
        password = request.json.get("password")

        # Fetch user from database
        user = User.find_user_by_username(username)
        print(user)
        if user and bcrypt.check_password_hash(user["password"], password):
            # Create JWT token (expires in 1 hour)
            access_token = create_access_token(identity=str(user["_id"]), fresh=True)
            # Create Refresh token (expires in 1 day)
            refresh_token = create_refresh_token(identity=str(user["_id"]))
            return {"access_token": access_token, "refresh_token": refresh_token}, 200

        return {"message": "Invalid credentials"}, 401


class RefreshTokenResource(Resource):
    """Handles refresh token requests"""

    @jwt_required(refresh=True)  # Ensures this route can only be accessed with a refresh token
    def post(self):
        """Refresh access token using refresh token"""
        current_user_id = get_jwt_identity()  # Get user ID from the refresh token

        # Create a new access token using the user ID
        access_token = create_access_token(identity=current_user_id, fresh=False)

        return {"access_token": access_token}, 200

