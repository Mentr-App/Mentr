from app.database import mongo, bcrypt
from datetime import datetime
from bson import ObjectId
from app.models.securityquestions import SecurityQuestions

class User:
    """User Model to interact with MongoDB"""

    @staticmethod
    def create_user(username, password, email, security_questions_id = ""):
        """Creates a new user with a hashed password."""
        print(username, password)
        if mongo.db.users.find_one({"username": username}):
            return {"message": "Username already exists"}, 400

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        print(hashed_password)
        user_id = mongo.db.users.insert_one(
            {
                "username": username,
                "email": email,
                "password": hashed_password,
                "created_at": datetime.utcnow(),
                "security_questions_id": ObjectId(security_questions_id)
            }
        ).inserted_id
        print(user_id)
        return str(user_id)

    @staticmethod
    def find_user_by_username(username):
        """Finds a user by username."""
        user = mongo.db.users.find_one({"username": username})
        return user if user else None

    @staticmethod
    def find_user_by_email(email):
        """Finds a user by username."""
        user = mongo.db.users.find_one({"email": email})
        return user if user else None

    @staticmethod
    def find_user_by_id(user_id):
        """Finds a user by userid"""
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        return user if user else None

    @staticmethod
    def delete_user(username):
        """Deletes a user by username."""
        result = mongo.db.users.delete_one({"username": username})
        if result.deleted_count:
            return {"message": "User deleted successfully"}, 200
        return {"message": "User not found"}, 404

    @staticmethod
    def update_user_email(user_id, username, email):
        """Updates a user's username and email given userid"""
        print("user_id: ")
        print(user_id)
        print("username: ")
        print(username)
        print("email: ")
        print(email)
        result = mongo.db.users.find_one_and_update({"_id":ObjectId(user_id)}, { '$set': { "username" : username, "email": email} })
        print(result)
        if result:
            return {"message": "User updated successfully"}, 200
        return {"message": "User not found!!!!"}, 404

    @staticmethod
    def insert_reset_token(user, token):
        mongo.db.users.update_one({'_id': user['_id']},{'$set': {'reset_token': token}})
    
    @staticmethod
    def verify_answers(answers, token):
        question_id = mongo.db.users.find_one({"reset_token" : token})["_id"]
        if not question_id:
            return False
        questions = SecurityQuestions.get_questions_by_id(ObjectId(question_id))
        if answers[0] == questions["answer1"] and answers[1] == questions["answer2"] and answers[3] == questions["answer3"]:
            return True
        return False
    @staticmethod
    def get_questions_id_by_reset_token(token):
        user = mongo.db.users.find_one({"reset_token": token})
        return user["security_questions_id"] if user else None
    
    @staticmethod
    def set_password(password, token):
        mongo.db.users.update_one({'reset_token': token},{'$set': {'password': password}})