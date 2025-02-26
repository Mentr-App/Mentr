from flask import request
from flask_restful import Resource
from app.models.user import User
from app.models.securityquestions import SecurityQuestions
from app.database import bcrypt
from datetime import datetime
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt_identity
)
from flask import Blueprint
from itsdangerous import URLSafeTimedSerializer
from flask_mail import Message
from app.mail import mail

serializer = URLSafeTimedSerializer("asjodiasjodqdhioqWeh 12jb3en 1easj lhdasb xmna bdjasjd")
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
    questions = request.json.get("securityQuestions")
    print(questions)
    question_id = SecurityQuestions.create_questions(questions)
    id = User.create_user(username, password, email, question_id)
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

@auth_bp.route('/get_questions', methods=["POST"])
def get_questions():
    email = request.json.get("email")       
    if not email:
        return {"Message": "Email must not be empty"},401
    user = User.find_user_by_email(email)
    if not user:
        return {"message": "No user with your email exists"}, 401
    print(user)
    questions = SecurityQuestions.get_questions_by_id(user["security_questions_id"])
    if not questions:
        return {"No questions"}, 401
    return {"questions": [questions["question1"], questions["question2"], questions["question3"]]}, 200

@auth_bp.route('/verify_answers', methods=["POST"])
def verify_answers():
    answers = request.json.get("answers")
    email = request.json.get("email")
    if User.verify_answers(answers, email):
        user = User.find_user_by_email(email)
        token = serializer.dumps(email, salt=str(datetime.now()) + 'password-reset-salt')
        User.insert_reset_token(user, token)
        frontendurl = "http://localhost:3000"
        reset_url = f"{frontendurl}/reset_password?token={token}"
        msg = Message("Password Reset Request", recipients=[email], body=f"To reset your password, visit the following link: {reset_url}")
        mail.send(msg)
        return {"message": "Check your email for a reset password email"}, 200
    return {"message": "Incorrect answers"}, 401

@auth_bp.route('/set_password', methods=["POST"])
def set_password():
    token = request.json.get("token")
    password = request.json.get("password")
    if User.set_password(password, token):
        return {"message": "Password successfully set"}, 200
    return {"message": "Error setting password"}, 401
    