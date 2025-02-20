from flask_restful import Resource, request
from app.database import mongo

class TestResource(Resource):
    # def get(self):
    #     print(request.json)
    #     return {"message": "Hi"}, 200


    def get(self):
        try:
            mongo.db.command("ping")
            return {"message": "mongodb connection success"}, 200
        except Exception as e:
            return {"error": str(e)}, 500