from datetime import datetime
from bson import ObjectId, json_util
from app import mongo # Assuming 'app' initializes 'mongo' (e.g., Flask-PyMongo)
# Removed flask_jwt_extended imports as they are not used in this specific method
import json

class Feed:
    """Feed model for handling Feed-related operations in MongoDB."""

    @staticmethod
    def get_feed(skip=0, limit=25, sort_by="new", activity_filter=None): # <-- Added activity_filter parameter
        """
        Fetch Feeds for the user feed with pagination, sorting, and optional activity filtering.

        Args:
            skip (int): Number of documents to skip for pagination.
            limit (int): Maximum number of documents to return.
            sort_by (str): Sorting criteria ('new', 'old', 'top', 'hot', 'controversial').
            activity_filter (str, optional): The activity name to filter posts by.
                                             Defaults to None (no filter).
        """

        # Sorting options (unchanged)
        sort_options = {
            "new": [("created_at", -1)],
            "old": [("created_at", 1)],
            "top": [("upvotes", -1)],
            "hot": [("comments", -1), ("upvotes", -1)],
            "controversial": [("downvotes", -1)],
        }

        # Validate sort_by (unchanged)
        if sort_by not in sort_options:
            print(f"Invalid sort_by value: '{sort_by}', defaulting to 'new'")
            sort_by = "new"

        # --- Start building the MongoDB aggregation pipeline ---
        pipeline = []

        # --- *** START: ADDED FILTER LOGIC *** ---
        # Conditionally add the $match stage for the activity filter
        # Apply the filter *before* sorting and pagination for efficiency
        if activity_filter and isinstance(activity_filter, str) and activity_filter.strip():
            # Use strip() to handle potential leading/trailing whitespace
            activity_to_match = activity_filter.strip()
            match_stage = {"$match": {"activity": activity_to_match}}
            pipeline.append(match_stage)
            print(f"Applying activity filter: {activity_to_match}")
        # --- *** END: ADDED FILTER LOGIC *** ---

        # --- Add the rest of the pipeline stages ---
        pipeline.extend([
            {"$sort": dict(sort_options[sort_by])},  # Apply sorting
            {"$skip": skip},                         # Apply pagination skip
            {"$limit": limit},                       # Apply pagination limit
            {                                        # Lookup author info
                "$lookup": {
                    "from": "users",                 # Collection to join
                    "localField": "author_id",       # Field from the input documents (posts)
                    "foreignField": "_id",           # Field from the documents of the "from" collection (users)
                    "as": "author_info",             # Output array field name
                }
            },
            {                                        # Add/modify fields
                "$addFields": {
                    # Safely get username using $ifNull in case author_info is empty or field missing
                    "author": {"$ifNull": [{"$arrayElemAt": ["$author_info.username", 0]}, "Unknown User"]},
                    # Format date to ISO 8601 string, compatible with JS Date()
                    "created_at": {
                        "$dateToString": {
                            "format": "%Y-%m-%dT%H:%M:%S.%LZ", # UTC timezone indicator 'Z'
                            "date": "$created_at",
                            "onNull": None # Return null if created_at is missing/null
                        }
                    },
                    # You can add other fields from author_info here if needed
                    # e.g., "author_avatar": {"$ifNull": [{"$arrayElemAt": ["$author_info.avatar", 0]}, None]}
                }
            },
            {                                        # Remove temporary or unwanted fields
                "$project": {
                    "author_info": 0                 # Remove the intermediate author_info array
                    # Explicitly include/exclude other fields if necessary
                    # By default, _id is included unless excluded: "_id": 0
                }
            }
        ])
        # --- End of pipeline construction ---

        try:
            # Execute the aggregation pipeline
            print(f"Executing aggregation pipeline: {pipeline}") # Log the final pipeline for debugging
            posts_cursor = mongo.db.posts.aggregate(pipeline)
            posts = list(posts_cursor) # Evaluate the cursor

            # Serialize BSON types (like ObjectId, dates) to JSON-compatible formats
            # RELAXED_JSON_OPTIONS attempts to use standard JSON types where possible
            # (e.g., numbers for counts instead of {"$numberInt": "..."})
            json_posts_string = json_util.dumps(posts, json_options=json_util.RELAXED_JSON_OPTIONS)
            json_posts = json.loads(json_posts_string) # Convert JSON string back to Python list/dict

            return json_posts

        except Exception as e:
            # Log the error for better debugging
            print(f"An error occurred during feed aggregation: {e}")
            print(f"Pipeline that caused error: {pipeline}")
            import traceback
            traceback.print_exc() # Print stack trace
            return [] # Return an empty list in case of error