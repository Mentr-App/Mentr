# Required imports
from bson import ObjectId
from app.database import mongo # Assuming 'mongo' is your initialized PyMongo instance
from datetime import datetime
import pymongo # For sort direction constants
# Assuming Chat class is available if needed for type hints or direct calls (not needed here)
# from app.models.chat import Chat

class Message:
    """
    Represents and manages message documents in a separate 'messages' collection.
    Each message references the chat it belongs to.
    """

    @staticmethod
    def get_message(message_id):
         # --- Fetch the newly created message to return it ---
        message = mongo.db.messages.find_one({"_id": message_id})
        if message:
            # Format the message document for JSON response
            message["_id"] = str(message["_id"])
            message["chat_id"] = str(message["chat_id"])
            message["sender_id"] = str(message["sender_id"])
            if isinstance(message.get("timestamp"), datetime):
                message["timestamp"] = message["timestamp"].isoformat() + "Z"
            return message
        return None


    @staticmethod
    def add_message(chat_id: str, sender_id: str, content: str):
        """
        Adds a new message to the 'messages' collection and updates the
        corresponding chat's 'last_message_at' timestamp.

        Args:
            chat_id (str): The string representation of the chat's ObjectId.
            sender_id (str): The string representation of the message sender's ObjectId.
            content (str): The text content of the message.

        Returns:
            ObjectId | None: The ObjectId of the newly created message, or None if an error occurs.
        """
        # --- Input Validation ---
        if not chat_id or not sender_id or content is None: # Allow empty string for content
             print("Error: chat_id, sender_id, and content are required.")
             return None

        # --- Convert IDs to ObjectId ---
        try:
            chat_oid = ObjectId(chat_id)
            sender_oid = ObjectId(sender_id)
        except Exception as e:
            print(f"Error converting IDs to ObjectId: {e}. chat_id='{chat_id}', sender_id='{sender_id}'")
            return None

        # --- Define the new message document ---
        message_timestamp = datetime.utcnow()
        new_message_doc = {
            "chat_id": chat_oid,      # Reference to the chat document
            "sender_id": sender_oid,  # ID of the user who sent the message
            "content": content,       # The message text
            "timestamp": message_timestamp, # Time the message was created
            # Optional fields:
            # "read_by": [], # List of user_ids who have read this message
            # "type": "text", # e.g., 'text', 'image', 'system'
        }

        # --- Insert the message and update the chat ---
        # NOTE: These two operations (insert message, update chat) are not atomic
        # without using MongoDB transactions. For high-consistency needs, consider transactions.
        try:
            # 1. Insert the new message document into the 'messages' collection
            #    Ensure you have indexes on messages collection: {'chat_id': 1, 'timestamp': -1} for performance
            message_result = mongo.db.messages.insert_one(new_message_doc)
            if not message_result.inserted_id:
                print("Error: Message insertion did not return an ID.")
                return None

            # 2. Update the 'last_message_at' field in the corresponding 'chats' document
            update_result = mongo.db.chats.update_one(
                {"_id": chat_oid},
                {"$set": {
                    "last_message_at": message_timestamp, 
                    "last_message": content
                }}
            )

            # Optional: Check if the chat document was actually found and updated
            if update_result.matched_count == 0:
                 print(f"Warning: Chat document with ID {chat_oid} not found during last_message_at update.")
                 # Decide how to handle this - maybe the message insert should be rolled back?
                 # For simplicity here, we proceed but log a warning.

            print(f"Message added successfully with ID: {message_result.inserted_id} to chat {chat_id}")
            return message_result.inserted_id # Return the ObjectId of the new message

        except Exception as e:
            print(f"Error adding message or updating chat: {e}")
            return None

    @staticmethod
    def get_messages_for_chat(chat_id: str, limit: int = 50, skip: int = 0):
        """
        Retrieves messages for a specific chat, sorted by timestamp.
        Supports basic pagination using limit and skip.

        Args:
            chat_id (str): The string representation of the chat's ObjectId.
            limit (int): Maximum number of messages to retrieve (default 50).
            skip (int): Number of messages to skip (for pagination, default 0).

        Returns:
            list | None: A list of message documents formatted for JSON (potentially empty),
                         or None if chat_id is invalid.
        """
        # --- Convert chat_id to ObjectId ---
        try:
            chat_oid = ObjectId(chat_id)
        except Exception as e:
            print(f"Error converting chat_id to ObjectId: {e}. chat_id='{chat_id}'")
            return None # Return None for invalid chat_id

        # --- Find messages ---
        try:
            # Query the 'messages' collection
            # Ensure you have an index on {'chat_id': 1, 'timestamp': 1} or {'chat_id': 1, 'timestamp': -1}
            messages_cursor = mongo.db.messages.find(
                {"chat_id": chat_oid}
            ).sort("timestamp", pymongo.ASCENDING).skip(skip).limit(limit) # Ascending for chronological order

            # Format messages for JSON response
            messages_list = []
            for msg_doc in messages_cursor:
                msg_doc["_id"] = str(msg_doc["_id"]) # Convert message ObjectId
                msg_doc["chat_id"] = str(msg_doc["chat_id"]) # Convert chat ObjectId reference
                msg_doc["sender_id"] = str(msg_doc["sender_id"]) # Convert sender ObjectId reference
                # Convert timestamp to ISO format string
                if isinstance(msg_doc.get("timestamp"), datetime):
                    msg_doc["timestamp"] = msg_doc["timestamp"].isoformat() + "Z" # Add Z for UTC
                messages_list.append(msg_doc)

            print(f"Retrieved {len(messages_list)} messages for chat {chat_id} (limit={limit}, skip={skip})")
            return messages_list
        except Exception as e:
            print(f"Error retrieving messages from database for chat {chat_id}: {e}")
            return [] # Return empty list on DB error after valid chat_id
