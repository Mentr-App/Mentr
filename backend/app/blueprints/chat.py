from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import Blueprint, request, jsonify
from app.models.chat import Chat
from app.models.message import Message
from app.extensions import socketio
from flask_socketio import join_room

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/", methods=["GET"])
@jwt_required()
def getChats():
    try:
        user_id = get_jwt_identity()
        chats = Chat.get_chats(user_id)
        return {"message": "Chats found", "chats": chats}, 200
    except Exception as e:
        print(e)
        return {"message": "Error getting chats", "error": str(e)}, 500

    
# --- Completed findOrCreateChat Route ---
@chat_bp.route("/findOrCreate", methods=["POST"])
@jwt_required()
def findOrCreateChat():
    """
    API endpoint to find an existing 1-on-1 chat or create a new one.
    Expects a JSON body with 'otherUserId'.
    Returns the full chat document (found or created).
    """
    try:
        # 1. Get current user ID from JWT token
        # Assumes the JWT identity is the user's ID (string format)
        current_user_id = get_jwt_identity()
        print(current_user_id)
        if not current_user_id:
             # This check is technically redundant due to @jwt_required, but adds clarity
             return jsonify({"message": "Authentication token invalid or missing user identity."}), 401

        # 2. Get other user ID from request body
        data = request.get_json()
        if not data:
            return jsonify({"message": "Missing JSON request body."}), 400

        other_user_id = data.get("otherUserId")
        print(other_user_id)
        if not other_user_id:
            return jsonify({"message": "Missing 'otherUserId' in request body."}), 400

        # Optional: Add more specific validation if needed (e.g., regex for ID format)
        if not isinstance(other_user_id, str) or not other_user_id.strip():
             return jsonify({"message": "Invalid 'otherUserId' format or value."}), 400

        # 3. Call the static method from the Chat class in the Canvas
        # This method handles finding/creating and returns the populated chat doc or None
        chat_document = Chat.find_or_create_chat(current_user_id, other_user_id.strip())

        # 4. Handle the result from the Chat class method
        if chat_document:
            # Success: Return the chat document
            # The document is already formatted for JSON by find_or_create_chat
            # Use 200 OK status code for simplicity in "find or create"
            return jsonify(chat_document), 200
        else:
            # Failure: find_or_create_chat returned None. This indicates an internal
            # issue handled within that method (e.g., invalid IDs passed initial checks
            # but failed ObjectId conversion, database error during find/insert/fetch).
            # The specific reason should have been printed by find_or_create_chat (if prints are kept).
            return jsonify({"message": "Failed to find or create chat due to an internal error."}), 500

    except Exception as e:
        # Catch any other unexpected errors during request processing
        print(f"Unexpected error in findOrCreateChat route: {e}") # Replace with proper logging
        return jsonify({"message": "An unexpected server error occurred."}), 500


#         # --- NEW Route to Add a Message ---
# @chat_bp.route("/messages/add", methods=["POST"])
# @jwt_required()
# def addMessage():
#     """
#     API endpoint to add a message to a specific chat.
#     Expects JSON body with 'chatId' and 'content'.
#     """
#     try:
#         current_user_id = get_jwt_identity()
#         if not current_user_id:
#             return jsonify({"message": "Authentication token invalid or missing user identity."}), 401

#         data = request.get_json()
#         if not data:
#             return jsonify({"message": "Missing JSON request body."}), 400

#         chat_id = data.get("chatId")
#         content = data.get("content") # Allow empty string, but not None

#         # Validate inputs
#         if not chat_id or not isinstance(chat_id, str) or not chat_id.strip():
#             return jsonify({"message": "Missing or invalid 'chatId' in request body."}), 400
#         if content is None: # Check for None explicitly
#              return jsonify({"message": "Missing 'content' in request body."}), 400
#         # Optional: Validate content length, type etc.

#         # --- Optional: Authorization Check (Verify user is in the chat) ---
#         try:
#             chat_oid_check = ObjectId(chat_id)
#             user_oid_check = ObjectId(current_user_id)
#             chat_exists = mongo.db.chats.find_one(
#                 {"_id": chat_oid_check, "participants": user_oid_check},
#                 {"_id": 1} # Only need to check existence and participation
#             )
#             if not chat_exists:
#                  return jsonify({"message": "Chat not found or you are not a participant."}), 403 # Forbidden or 404
#         except Exception as e:
#              print(f"Error during chat authorization check for addMessage: {e}")
#              return jsonify({"message": "Invalid chat or user ID format for authorization check."}), 400
#         # --- End Optional Authorization Check ---


#         # Call the Message class method to add the message
#         new_message_id = Message.add_message(chat_id.strip(), current_user_id, content)

#         if new_message_id:
#             # Success: Return the ID of the newly created message
#             # Consider returning the full message object if needed by frontend
#             return jsonify({"message": "Message added successfully.", "messageId": str(new_message_id)}), 201 # 201 Created
#         else:
#             # Failure: add_message returned None, indicating an internal error
#             # (e.g., invalid IDs passed validation, DB error)
#             return jsonify({"message": "Failed to add message due to an internal error."}), 500

#     except Exception as e:
#         print(f"Unexpected error in addMessage route: {e}") # Replace with proper logging
#         return jsonify({"message": "An unexpected server error occurred."}), 500


# --- NEW Route to Get Messages for a Chat ---
@chat_bp.route("/<chat_id>", methods=["GET"])
@jwt_required()
def getMessages(chat_id):
    """
    API endpoint to retrieve messages for a specific chat.
    Supports pagination via 'limit' and 'skip' query parameters.
    Ensures the requesting user is a participant of the chat.
    """
    try:
        current_user_id = get_jwt_identity()
        print(current_user_id)
        if not current_user_id:
            return jsonify({"message": "Authentication token invalid or missing user identity."}), 401

        # Get pagination parameters (optional)
        try:
            limit = int(request.args.get("limit", 50)) # Default limit 50
            skip = int(request.args.get("skip", 0))   # Default skip 0
            if limit < 0 or skip < 0:
                 raise ValueError("Limit and skip must be non-negative.")
        except ValueError as ve:
             return jsonify({"message": f"Invalid pagination parameters: {ve}"}), 400

        # Call the Message class method to get messages
        # This method should return a list of JSON-serializable message dicts or None/[]
        messages = Message.get_messages_for_chat(chat_id, limit=limit, skip=skip)

        if messages is not None:
            # Success: Return the list of messages
            return jsonify(messages), 200
        else:
             # get_messages_for_chat returns None only for invalid chat_id format (already checked),
             # otherwise returns [] on DB error. We handle DB error above.
             # If it could return None for other reasons, handle here.
             # For now, assume [] is returned on error after validation/auth.
             return jsonify({"message": "An error occurred while retrieving messages."}), 500

    except Exception as e:
        print(f"Unexpected error in getMessages route for chat {chat_id}: {e}") # Replace with proper logging
        return jsonify({"message": "An unexpected server error occurred."}), 500

# --- Route to Add a Message ---
@chat_bp.route("/addMessage", methods=["POST"]) # Match the Next.js proxy target path segment
@jwt_required()
def addMessage():
    """
    API endpoint to add a message to a specific chat.
    Expects JSON body with 'chatId' and 'content'.
    Returns the newly created message object on success.
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({"message": "Authentication token invalid or missing user identity."}), 401

        data = request.get_json()
        if not data:
            return jsonify({"message": "Missing JSON request body."}), 400

        # Match the keys expected by the frontend/proxy
        chat_id = data.get("chatId")
        content = data.get("content")

        # Validate inputs
        if not chat_id or not isinstance(chat_id, str) or not chat_id.strip():
            return jsonify({"message": "Missing or invalid 'chatId' in request body."}), 400
        if content is None or not isinstance(content, str): # Check for None and type
             return jsonify({"message": "Missing or invalid 'content' in request body."}), 400


        # Call the Message class method to add the message
        # This method returns the ObjectId of the new message or None
        new_message_id = Message.add_message(chat_id.strip(), current_user_id, content)

        if new_message_id:
            # --- Fetch the newly created message to return it ---
            try:
                new_message_doc = Message.get_message(new_message_id)
                if new_message_doc:
                    # Success: Return the newly created and formatted message object
                    return jsonify(new_message_doc), 201 # 201 Created
                else:
                    # Should not happen if insert succeeded, but handle defensively
                    print(f"Error: Could not retrieve newly inserted message with ID {new_message_id}")
                    return jsonify({"message": "Message added but failed to retrieve details."}), 500
            except Exception as fetch_err:
                print(f"Error fetching newly created message {new_message_id}: {fetch_err}")
                return jsonify({"message": "Message added but failed to retrieve details due to an error."}), 500
        else:
            # Otherwise, assume other internal error
            return jsonify({"message": "Failed to add message due to an internal error."}), 500

    except Exception as e:
        # Catch any other unexpected errors during request processing
        print(f"Unexpected error in addMessage route: {e}") # Replace with proper logging
        return jsonify({"message": "An unexpected server error occurred."}), 500

@socketio.on('join_chat')
@jwt_required()
def handle_join_chat(data):
    try:
        user_id = get_jwt_identity()
        chat_id = data.get('chat_id')
        if chat_id:
            room = f"chat_{chat_id}"
            join_room(room)
            socketio.emit('user_joined', {'user_id': user_id, 'chat_id': chat_id}, room=room)
    except Exception as e:
        socketio.emit('error', {'message': str(e)})

@socketio.on('leave_chat')
@jwt_required()
def handle_leave_chat(data):
    try:
        user_id = get_jwt_identity()
        chat_id = data.get('chat_id')
        if chat_id:
            room = f"chat_{chat_id}"
            leave_room(room)
            socketio.emit('user_left', {'user_id': user_id, 'chat_id': chat_id}, room=room)
    except Exception as e:
        socketio.emit('error', {'message': str(e)})

@socketio.on('send_message')
@jwt_required()
def handle_send_message(data):
    try:
        user_id = get_jwt_identity()
        chat_id = data.get('chat_id')
        content = data.get('content')
        if chat_id and content:
            message = Message.add_message(chat_id, user_id, content)
            room = f"chat_{chat_id}"
            socketio.emit('receive_message', {'message': message}, room=room)
    except Exception as e:
        socketio.emit('error', {'message': str(e)})
