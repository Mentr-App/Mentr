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
from flask import Blueprint

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    """Login a user and generate a JWT token."""
    username = request.json.get("username")
    password = request.json.get("password")

    # Fetch user from database
    user = User.find_user_by_username(username)
    print(user)
    if user and bcrypt.check_password_hash(user["password"], password):
        access_token = create_access_token(identity=str(user["_id"]), fresh=True)
        refresh_token = create_refresh_token(identity=str(user["_id"]))
        return {"access_token": access_token, "refresh_token": refresh_token}, 200

    return {"message": "Invalid credentials"}, 401

@auth_bp.route("/signup", methods=["POST"])
def signup():
    username = request.json.get("username")
    if User.find_user_by_username(username):
        return {"message": "Username already exists"}, 401
    email = request.json.get("email")
    if not email:
        email = ""
    elif User.find_user_by_email(email):
        return {"message": "Email already exists"}, 401
    password = request.json.get("password")
    id = User.create_user(username, password, email)
    access_token = create_access_token(identity=id, fresh=True)
    refresh_token = create_refresh_token(identity=id)
    return {"access_token": access_token, "refresh_token": refresh_token}, 200

    
    
@jwt_required(refresh=True) 
@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    """Refresh access token using refresh token"""
    current_user_id = get_jwt_identity()  # Get user ID from the refresh token

    # Create a new access token using the user ID
    access_token = create_access_token(identity=current_user_id, fresh=False)

    return {"access_token": access_token}, 200