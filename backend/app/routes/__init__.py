from app.resources.auth import AuthResource, RefreshTokenResource
from app.resources.post import PostResource
from app.resources.test import TestResource
from app.resources.user import UserResource
from app.resources.feed import FeedResource

def register_resources(api):
# Add routes
    api.add_resource(AuthResource, "/auth/login")
    api.add_resource(RefreshTokenResource, "/auth/refresh")
    api.add_resource(PostResource, "/post")
    api.add_resource(TestResource, "/test")
    api.add_resource(UserResource, "/register")
    api.add_resource(FeedResource, "/feed")




