from app.database import mongo, bcrypt
from bson import ObjectId

class SecurityQuestions:
    @staticmethod
    def create_questions(questions):
        return mongo.db.security_questions.insert_one({
            "question1": questions[0]["question"],
            "question2": questions[1]["question"],
            "question3": questions[2]["question"],
            "answer1": questions[0]["answer"],
            "answer2": questions[1]["answer"],
            "answer3": questions[2]["answer"]
        }).inserted_id
        
    @staticmethod
    def get_questions_by_id(id):
        questions = mongo.db.users.find_one({"_id": ObjectId(id)})
        return questions if questions else None
