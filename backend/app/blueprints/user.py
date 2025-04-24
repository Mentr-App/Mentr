from flask_restful import request
from app.models.user import User
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import mongo
import re # For regular expression matching

user_bp = Blueprint("user", __name__)

@user_bp.route("/", methods=["GET"])
def get():
    """Retrieve user details by username."""
    #TODO
    username = request.json.get("username")

    user = User.find_user(username)
    if user:
        return user, 200
    return {"message": "User not found"}, 404

@user_bp.route("/", methods=["DELETE"])
def delete():
    """Delete a user by username."""
    username = request.json.get("username")

    return User.delete_user(username)

@user_bp.route("/votes", methods=["GET"])
@jwt_required()
def get_user_votes():
    """Get all posts that the current user has voted on"""
    user_id = get_jwt_identity()
    
    # Find all posts where the user has voted
    posts = mongo.db.posts.find(
        {"votes": {"$elemMatch": {"user_id": user_id}}},
        {"votes": {"$elemMatch": {"user_id": user_id}}}
    )
    
    # Create a map of post_id to vote_type
    votes_map = {
        str(post["_id"]): post["votes"][0]["vote_type"]
        for post in posts
    }
    
    return {"votes": votes_map}, 200

@user_bp.route("/users", methods=["GET"])
@jwt_required() # Ensures the user is logged in
def get_users():
    """
    Searches for users based on a username key provided as a query parameter.
    Performs a case-insensitive partial match.
    Returns a list of matching users containing their ID and username.
    """
    try:
        # 1. Get the search key from query parameters (for GET requests)
        # Example request: GET /users?key=john
        search_key = request.args.get("key", "").strip() # Use request.args for GET

        # Optional: Add validation for the key length if desired
        if not search_key:
            # Return empty list if no key is provided, or you could return an error
            return jsonify([]), 200
            # Or return an error:
            # return jsonify({"msg": "Search key parameter 'key' is required"}), 400

        # 2. Create a case-insensitive regular expression for partial matching
        # 'i' flag makes it case-insensitive
        # This will find usernames containing the search_key
        regex_pattern = re.compile(f".*{re.escape(search_key)}.*", re.IGNORECASE)
        # Alternative: Starts with search_key
        # regex_pattern = re.compile(f"^{re.escape(search_key)}", re.IGNORECASE)

        # 3. Query the database
        # Find users where the 'username' field matches the regex pattern
        # Project only the necessary fields (_id and username) to avoid sending sensitive data
        users_cursor = mongo.db.users.find(
            {"username": regex_pattern},
            {"_id": 1, "username": 1} # Projection: 1 means include, 0 means exclude
        )

        # 4. Format the results
        users_list = []
        for user in users_cursor:
            # Convert ObjectId to string for JSON serialization
            user["_id"] = str(user["_id"])
            users_list.append(user)

        # 5. Return the JSON response
        return jsonify(users_list), 200

    except Exception as e:
        # Basic error handling
        print(f"Error in /users route: {e}") # Log the error server-side
        # Return a generic error message to the client
        return jsonify({"msg": "An error occurred while searching for users."}), 500