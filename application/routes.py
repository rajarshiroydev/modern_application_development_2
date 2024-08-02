import datetime
from app import app
from functools import wraps
from application.models import db, Section, User, Books, Cart, Issued, Feedbacks
from werkzeug.security import check_password_hash, generate_password_hash
from flask import request, jsonify, render_template, session, redirect, url_for, flash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    JWTManager,
)
import jwt
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ----------------------------Role based access------------------------------------#

SECRET_KEY = "mad2_project"


def encode_user_data(user_id, role):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.datetime.utcnow()
        + datetime.timedelta(hours=1),  # Token expiration time
    }

    # Encode the payload to create the JWT token
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token


def auth_required(func):
    @wraps(func)
    def inner(*args, **kwargs):
        token = session.get("jwt_token")
        if token:
            try:
                decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

                user_id = decoded_token.get("user_id")
                role = decoded_token.get("role")

                return func(*args, **kwargs)

            except jwt.ExpiredSignatureError:
                return redirect(url_for("login"))
            except jwt.InvalidTokenError:
                return redirect(url_for("login"))
        else:
            return redirect(url_for("login"))

    return inner


# Decorator for authentication of admin
# def admin_required(func):
#     @wraps(func)
#     @jwt_required()
#     def inner(*args, **kwargs):
#         user_id = get_jwt_identity()
#         user = User.query.get(user_id)
#         if not user or not user.is_admin:
#             flash("You are not authorized to access this page")
#             return redirect(url_for("index"))
#         return func(*args, **kwargs)

#     return inner


# ----------------------------Home------------------------------------#


@app.route("/", methods=["GET"])
# @auth_required
def home():
    return render_template("index.html")


# ----------------------------Register, Login and Logout------------------------------------#


@app.route("/register", methods=["GET", "POST"])
def register_post():
    data = request.get_json()
    name = data.get("name")
    username = data.get("username")
    password = data.get("password")
    confirm_password = data.get("confirm_password")

    if not name or not username or not password or not confirm_password:
        flash("Please fill out all the fields")
        return jsonify({"error": "Please fill out all the fields"}), 400

    if password != confirm_password:
        flash("Passwords do not match")
        return jsonify({"error": "Passwords do not match"}), 400

    user = User.query.filter_by(username=username).first()

    if user:
        flash("User already exists")
        return jsonify({"error": "User already exists"}), 409

    password_hash = generate_password_hash(password)
    new_user = User(username=username, passhash=password_hash, name=name, role="user")
    db.session.add(new_user)
    db.session.commit()
    flash("Registered successfully.")
    return jsonify({"message": "Registered successfully."}), 201


@app.route("/login", methods=["POST"])
def login_post():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Please fill out all the fields"}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.passhash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    if user:
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token)

    flash("Registered successfully.")
    return jsonify({"message": "Logged in successfully."}), 201


# ------------------------------Admin & Sections------------------------------------#


@app.route("/admin")
@auth_required
def admin():
    sections = Section.query.all()
    section_data = [
        {"name": section.name, "size": len(section.books)} for section in sections
    ]
    return jsonify(section_data), 200


@app.route("/section/add")
@auth_required
def add_section():
    return render_template("/section/add.html")


@app.route("/section/add", methods=["POST"])
def add_section_post():
    name = request.form.get("name")

    if not name:
        flash("Please fill out all the fields")
        return redirect(url_for("add_section"))

    section = Section(name=name)
    db.session.add(section)
    db.session.commit()

    flash("Section created successfully")
    return redirect(url_for("admin"))
