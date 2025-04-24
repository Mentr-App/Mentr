from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from app.models.user import User
from app.image import image_handler
from flask_socketio import SocketIO

mongo = PyMongo()
jwt = JWTManager()
img_handler = image_handler()
socketio = SocketIO(cors_allowed_origins="*")

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    print("identity:",identity)
    return User.find_user_by_id(identity)