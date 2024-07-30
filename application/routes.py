from app import app
from functools import wraps
from application.models import db, Section, User, Books, Cart, Issued, Feedbacks
from werkzeug.security import check_password_hash, generate_password_hash
from flask import request, jsonify, render_template, session, redirect, url_for, flash
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ----------------------------Role based access------------------------------------#


def auth_required(func):
    @wraps(func)
    def inner(*args, **kwargs):
        if "user_id" in session:
            return func(*args, **kwargs)
        else:
            return redirect(url_for("login"))

    return inner


# Decorator for authentication of admin
def admin_required(func):
    @wraps(func)
    def inner(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login"))

        user = User.query.get(session["user_id"])

        if not user.is_admin:
            flash("You are not authorized to access this page")
            return redirect(url_for("index"))
        return func(*args, **kwargs)

    return inner


# ----------------------------Home------------------------------------#


@app.route("/", methods=["GET"])
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

    new_user = User(username=username, passhash=password_hash, name=name)
    db.session.add(new_user)
    db.session.commit()
    flash("Registered successfully.")
    return jsonify({"message": "Registered successfully."}), 201


@app.route("/login", methods=["GET", "POST"])
def login_post():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        flash("Please fill out all the fields")
        return jsonify({"error": "Please fill out all the fields"}), 400

    user = User.query.filter_by(username=username).first()

    if not user:
        flash("You are not registered. Register first.")
        return jsonify({"error": "You are not registered. Register first."}), 404

    if not check_password_hash(user.passhash, password):
        flash("Incorrect password")
        return jsonify({"error": "Incorrect password"}), 401

    flash("Login successful")
    return jsonify({"message": "Login successful."}), 200


# ------------------------------Admin & Sections------------------------------------#


@app.route("/admin")
def admin():
    sections = Section.query.all()
    section_data = [
        {"name": section.name, "size": len(section.books)} for section in sections
    ]
    return jsonify(section_data), 200
