from flask_jwt_extended import JWTManager
from app.models.user import User

jwt = JWTManager()

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    print("identity:",identity)
    return User.find_user_by_id(identity)