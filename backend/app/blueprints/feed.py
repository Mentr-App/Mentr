from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from app.models.feed import Feed
from app.models.post import Post
from flask import Blueprint

feed_bp = Blueprint("feed", __name__)

@feed_bp.route("/", methods=["GET"])
def get_feed():
    # Get pagination parameters from request
    skip = request.args.get('skip', default=0, type=int)
    limit = request.args.get('limit', default=25, type=int)
    sort_by = request.args.get('sort_by', default='new', type=str)
        
    feed_result = Feed.get_feed(skip=skip, limit=limit, sort_by=sort_by)
    total_count = Post.get_total_posts()
    
    return {
        "message": "Feed retrieved successfully", 
        "feed": feed_result,
        "total_count": total_count
    }, 200