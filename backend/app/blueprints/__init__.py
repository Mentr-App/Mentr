from .auth import auth_bp
from .post import post_bp
from .test import test_bp
from .feed import feed_bp
from .user import user_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(post_bp, url_prefix='/post')
    app.register_blueprint(test_bp, url_prefix="/test")
    app.register_blueprint(feed_bp, url_prefix="/feed")
    app.register_blueprint(user_bp, url_prefix="/user")