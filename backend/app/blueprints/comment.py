from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import Blueprint, request
from app.models.comment import Comment
from bson import ObjectId

comment_bp = Blueprint("comment", __name__)


@comment_bp.route("/<comment_id>", methods=["POST"])
@jwt_required()
def edit_comment(comment_id):
    try:
        content = request.json.get("content")
        if not content:
            return {"message": "Comment content cannot be empty"}, 404

        comment = Comment.edit_comment(comment_id, content)
        if not comment:
            return {"message": "Failed to edit comment"}, 500
        
        return {"message": "Comment edited successfully", "comment": comment}
    except Exception as e:
        print("Error editing comment:", str(e))
        return {"message": "Error editing comment", "error": str(e)}, 500

@comment_bp.route("/<comment_id>", methods=["DELETE"])
@jwt_required()
def delete_comment(comment_id):
    try:
        comment = Comment.delete_comment(comment_id)
        if not comment:
            return {"message": "Failed to delete comment"}, 500
        
        return {"message": "Comment deleted successfully", "comment": comment}
    except Exception as e:
        print("Error deleting comment:", str(e))
        return {"message": "Error deleting comment", "error": str(e)}, 500

@comment_bp.route("/mark/<comment_id>", methods=["POST"])
@jwt_required()
def mark_comment(comment_id):
    try:
        # Get the user ID from the JWT
        user_id = get_jwt_identity()
        
        # Get the helpful status from the request
        helpful = request.json.get("helpful", True)
        
        # Mark the comment
        comment = Comment.mark_comment(comment_id, user_id, helpful)
        
        if not comment:
            return {"message": "Comment not found"}, 404
        
        return {
            "message": f"Comment marked as {'helpful' if helpful else 'unhelpful'} successfully",
            "comment": comment,
            "mark_status": "helpful" if helpful else "unhelpful"
        }
    except Exception as e:
        print("Error marking comment:", str(e))
        return {"message": "Error marking comment", "error": str(e)}, 500

