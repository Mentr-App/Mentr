from .auth import auth_bp
from .post import post_bp
from .test import test_bp
from .feed import feed_bp
from .user import user_bp
from .profile import profile_bp
from .feedback import feedback_bp
from .comment import comment_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(post_bp, url_prefix='/post')
    app.register_blueprint(test_bp, url_prefix="/test")
    app.register_blueprint(feed_bp, url_prefix="/feed")
    app.register_blueprint(user_bp, url_prefix="/user")
    app.register_blueprint(profile_bp, url_prefix="/profile")
    app.register_blueprint(feedback_bp, url_prefix="/feedback")
    app.register_blueprint(comment_bp, url_prefix="/comment")