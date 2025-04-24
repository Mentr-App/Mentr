# Required imports
from bson import ObjectId
from app.database import mongo # Assuming 'mongo' is your initialized PyMongo instance
from datetime import datetime
import pymongo # For sort direction constants
from app.extensions import img_handler

# --- Helper Function to Fetch User Details ---
# (Place this outside the class or in a common utility module)
def get_user_details(user_ids: list[ObjectId]) -> dict[str, dict]:
    """
    Fetches specific details for a list of user ObjectIds.

    Args:
        user_ids (list[ObjectId]): A list of user ObjectIds to fetch.

    Returns:
        dict[str, dict]: A dictionary mapping stringified ObjectId to user details dict.
                         Includes id, name, userType, company, industry, major, avatarUrl.
                         Returns empty dict if input is empty or on error.
    """
    if not user_ids:
        return {}
    try:
        # Ensure IDs are unique ObjectIds before querying
        unique_user_oids = list(set(user_ids))
        if not unique_user_oids:
            return {}

        # --- Updated Projection ---
        # Request the required fields from the users collection
        projection = {
            "_id": 1,
            "username": 1,
            "userType": 1,
            "company": 1,
            "industry": 1,
            "major": 1,
            "profile_picture": 1,
        }

        users_cursor = mongo.db.users.find(
            {"_id": {"$in": unique_user_oids}},
            projection # Use the updated projection
        )

        # --- Updated Mapping ---
        # Create a mapping from string ID to the detailed user doc
        user_map = {}
        for user in users_cursor:
             user_id_str = str(user['_id'])
             profile_picture = None
             if user.get("profile_picture") != None:
                profile_picture = img_handler.get(user.get("profile_picture"))
             user_map[user_id_str] = {
                 "_id": user_id_str,
                 "name": user.get("username", "Unknown"),
                 "userType": user.get("userType"), # Get userType or None
                 "company": user.get("company"),   # Get company or None
                 "industry": user.get("industry"), # Get industry or None
                 "major": user.get("major"),       # Get major or None
                 # Map profile_picture to avatarUrl for frontend consistency
                 "avatarUrl": profile_picture # Get profile_picture or None
             }
        return user_map

    except Exception as e:
        print(f"Error fetching user details for IDs {user_ids}: {e}") # Optional: Keep print for basic debug
        return {} # Return empty on error

class Chat:
    """
    Represents and manages chat documents in the MongoDB database.
    """
    @staticmethod
    def find_or_create_chat(user1_id: str, user2_id: str):
        """
        Finds or creates a 1-on-1 chat document between two participants.
        Returns the full chat document with populated participant details.

        Args:
            user1_id (str): The string representation of the first user's ObjectId.
            user2_id (str): The string representation of the second user's ObjectId.

        Returns:
            dict | None: The full chat document (as a dictionary) with populated participants,
                         or None if an error occurs (e.g., invalid IDs, DB error).
        """
        # --- Input Validation ---
        if not user1_id or not user2_id:
            return None
        if user1_id == user2_id:
            return None

        # --- Convert string IDs to ObjectId ---
        try:
            user1_oid = ObjectId(user1_id)
            user2_oid = ObjectId(user2_id)
        except Exception as e:
            print(f"Error converting IDs to ObjectId: {e}. user1_id='{user1_id}', user2_id='{user2_id}'")
            return None

        chat_id_to_fetch = None
        is_new_chat = False

        # --- Check if a chat already exists ---
        try:
            existing_chat = mongo.db.chats.find_one(
                {"participants": {"$all": [user1_oid, user2_oid], "$size": 2}},
                {"_id": 1}
            )
            if existing_chat:
                chat_id_to_fetch = existing_chat['_id']
            else:
                 is_new_chat = True
        except Exception as e:
            print(f"Error checking for existing chat: {e}")
            return None

        # --- Create new chat if it doesn't exist ---
        if is_new_chat:
            new_chat_doc = {
                "participants": [user1_oid, user2_oid],
                "created_at": datetime.utcnow(),
                "last_message_at": None,
                "last_message": None,
            }
            try:
                result = mongo.db.chats.insert_one(new_chat_doc)
                if result.inserted_id:
                    chat_id_to_fetch = result.inserted_id
                else:
                    print("Error: MongoDB insertion did not return an ID.")
                    return None
            except Exception as e:
                print(f"Error inserting chat into database: {e}")
                return None

        # --- Fetch the full chat document by ID ---
        if not chat_id_to_fetch:
             print("Error: chat_id_to_fetch is unexpectedly None.")
             return None

        try:
            chat_document = mongo.db.chats.find_one({"_id": chat_id_to_fetch})
            if not chat_document:
                print(f"Error: Could not retrieve chat document with ID: {chat_id_to_fetch}")
                return None

            # --- Populate Participant Details ---
            participant_ids = chat_document.get("participants", [])
            if participant_ids:
                user_details_map = get_user_details(participant_ids) # Calls updated helper
                populated_participants = []
                for p_oid in participant_ids:
                    p_id_str = str(p_oid)
                    # Use fetched details or a fallback structure for the whole user object
                    user_info = user_details_map.get(p_id_str, {"id": p_id_str, "name": "Unknown User"})
                    populated_participants.append(user_info)
                chat_document["participants"] = populated_participants
            else:
                 chat_document["participants"] = []

            # --- Format fields for JSON response ---
            chat_document["_id"] = str(chat_document["_id"])
            if isinstance(chat_document.get("created_at"), datetime):
                 chat_document["created_at"] = chat_document["created_at"].isoformat() + "Z"
            if isinstance(chat_document.get("last_message_at"), datetime):
                 chat_document["last_message_at"] = chat_document["last_message_at"].isoformat() + "Z"

            return chat_document

        except Exception as e:
            print(f"Error fetching or populating chat document {chat_id_to_fetch}: {e}")
            return None

    # --- MODIFIED get_chats Method ---
    @staticmethod
    def get_chats(user_id: str):
        """
        Retrieves all chat documents where the given user_id is a participant,
        sorted by the most recent message time, with participant details populated.

        Args:
            user_id (str): The string representation of the user's ObjectId.

        Returns:
            list | None: A list of populated chat documents (potentially empty),
                         or None if user_id is invalid.
        """
        try:
            user_oid = ObjectId(user_id)
        except Exception as e:
            print(f"Error converting user_id to ObjectId: {e}. user_id='{user_id}'")
            return None # Return None for invalid user ID

        try:
            # 1. Find chats where the user is a participant
            chats_cursor = mongo.db.chats.find(
                {"participants": user_oid}
            ).sort("last_message_at", pymongo.DESCENDING)

            # Convert cursor to list (contains ObjectIds for participants initially)
            chats_list_raw = list(chats_cursor)
            if not chats_list_raw:
                return [] # Return empty list if no chats found

            # 2. Collect all unique participant ObjectIds from all chats
            all_participant_oids = set()
            for chat in chats_list_raw:
                all_participant_oids.update(chat.get("participants", []))

            # 3. Fetch details for all unique participants (using updated helper)
            user_details_map = get_user_details(list(all_participant_oids))
            if not user_details_map and all_participant_oids:
                 print(f"Warning: Could not fetch details for participants: {all_participant_oids}")

            # 4. Populate and format each chat document
            populated_chats_list = []
            for chat_doc in chats_list_raw:
                populated_participants = []
                participant_oids_in_chat = chat_doc.get("participants", [])

                for p_oid in participant_oids_in_chat:
                    p_id_str = str(p_oid)
                    # Use fetched details or a fallback structure for the whole user object
                    user_info = user_details_map.get(p_id_str, {"id": p_id_str, "name": "Unknown User"})
                    populated_participants.append(user_info)

                # Update the chat document
                chat_doc["participants"] = populated_participants

                # Format other fields for JSON
                chat_doc["_id"] = str(chat_doc["_id"])
                if isinstance(chat_doc.get("created_at"), datetime):
                    chat_doc["created_at"] = chat_doc["created_at"].isoformat() + "Z"
                if isinstance(chat_doc.get("last_message_at"), datetime):
                    chat_doc["last_message_at"] = chat_doc["last_message_at"].isoformat() + "Z"
                elif chat_doc.get("last_message_at") is None:
                     chat_doc["last_message_at"] = None

                populated_chats_list.append(chat_doc)

            print(f"Found and populated {len(populated_chats_list)} chats for user {user_id}")
            return populated_chats_list

        except Exception as e:
            print(f"Error retrieving/populating chats for user {user_id}: {e}")
            return [] # Return empty list on DB or processing error after valid user_id

# --- Example Usage (Illustrative) ---
# (Example usage remains the same, but the output will now contain more user details)
