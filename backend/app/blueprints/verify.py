# --- verify.py (Flask Blueprint) ---
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from app.models.user import User
from app.database import mongo
from app.mail import mail
from bson.json_util import dumps
import random

verify_bp = Blueprint("verify", __name__)

@verify_bp.route("/initiate", methods=["POST"])
@jwt_required()
def initiate_verification():
    email = request.json.get("email")
    if not email:
        return {"message": "Email is required"}, 400

    user_id = get_jwt_identity()
    user = User.find_user_by_id(user_id)
    if not user:
        return {"message": "User not found"}, 404

    code = random.randint(100000, 999999)
    msg = Message(
        "Mentr Verification Code",
        recipients=[email],
        body=f"Your verification code is: {code}"
    )
    mail.send(msg)

    # Store both the code and submitted email
    User.set_verification_code(user, code)
    mongo.db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"submitted_email": email}}
    )

    return {"message": "Verification email sent"}, 200

@verify_bp.route("/submit", methods=["POST"])
@jwt_required()
def submit_verification():
    email = request.json.get("email")
    code = request.json.get("code")

    if not email or not code:
        return {"message": "Email and code are required"}, 400

    user_id = get_jwt_identity()
    user = User.find_user_by_id(user_id)
    if not user:
        return {"message": "User not found"}, 404

    print(f"[VERIFY] Submitted code: {code}")
    print(f"[VERIFY] Stored code: {user.get('verification_code')}")

    if str(user.get("verification_code")) == str(code):
        domain = email.split("@")[-1]
        uni = mongo.db.unis.find_one({"domains": domain})
        company = mongo.db.companies.find_one({"domain": domain})

        update_fields = {"verified": True}

        # Set either university or company if found
        if uni:
            update_fields["university"] = uni["name"]
        elif company:
            update_fields["company"] = company["company"]

        # Step 1: set verified status and affiliation
        mongo.db.users.update_one(
            {"_id": user["_id"]},
            {"$set": update_fields}
        )

        # Step 2: unset temporary fields
        mongo.db.users.update_one(
            {"_id": user["_id"]},
            {"$unset": {"verification_code": "", "submitted_email": ""}}
        )

        return {"message": "Email successfully verified"}, 200
    else:
        return {"message": "Invalid verification code"}, 401


@verify_bp.route("/universities", methods=["GET"])
def get_universities():
    try:
        universities = list(mongo.db.unis.find())
        return jsonify(universities), 200
    except Exception as e:
        return jsonify({"message": "Error retrieving universities", "error": str(e)}), 500


@verify_bp.route("/companies", methods=["GET"])
def get_companies():
    try:
        companies = list(mongo.db.companies.find())
        return dumps(companies), 200
    except Exception as e:
        return {"message": "Error retrieving companies", "error": str(e)}, 500


@verify_bp.route("/request", methods=["POST"])
@jwt_required()
def company_request():
    data = request.json
    company = data.get("company")
    domain = data.get("domain")

    if not company or not domain:
        return {"message": "Company and domain are required"}, 400

    try:
        mongo.db.company_requests.insert_one({
            "company": company,
            "domain": domain,
            "status": "pending"
        })
        return {"message": "Company request submitted"}, 200
    except Exception as e:
        return {"message": "Error submitting request", "error": str(e)}, 500

@verify_bp.route("/checkRequest", methods=["GET"])
@jwt_required()
def check_company_request():
    company = request.args.get("company")
    if not company:
        return {"message": "Company is required"}, 400

    result = mongo.db.company_requests.find_one({
        "company": {"$regex": f"^{company}$", "$options": "i"}
    })

    if result:
        return {"status": result.get("status", "pending")}, 200
    return {"status": "not_found"}, 200
