import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from flask import request, jsonify, render_template
from werkzeug.security import check_password_hash, generate_password_hash
from application.models import db, User

app = create_app()


@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login_post():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Please fill out all the fields"}), 400

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"error": "You are not registered. Register first."}), 404

    if not check_password_hash(user.passhash, password):
        return jsonify({"error": "Incorrect password"}), 401

    return jsonify({"message": "Login successful."}), 200


@app.route("/register", methods=["POST"])
def register_post():
    data = request.get_json()
    name = data.get("name")
    username = data.get("username")
    password = data.get("password")
    confirm_password = data.get("confirm_password")

    if not name or not username or not password or not confirm_password:
        return jsonify({"error": "Please fill out all the fields"}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    user = User.query.filter_by(username=username).first()

    if user:
        return jsonify({"error": "User already exists"}), 409

    password_hash = generate_password_hash(password)

    new_user = User(username=username, passhash=password_hash, name=name)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registered successfully."}), 201


if __name__ == "__main__":
    app.run()
