from app.database import mongo, bcrypt
from bson import ObjectId

class SecurityQuestions:
    @staticmethod
    def create_questions(answer1, answer2, answer3):
        return mongo.db.security_questions.insert_one({
            "answer1": answer1,
            "answer2": answer2,
            "answer3": answer3
        }).inserted_id
        
    @staticmethod
    def get_questions_by_id(id):
        questions = mongo.db.users.find_one({"_id": ObjectId(id)})
        return questions if questions else None
