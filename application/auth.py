import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from flask import request, jsonify, render_template
from werkzeug.security import check_password_hash
from application.models import User

app = create_app()

@app.route("/", methods=["GET"])
def home():
    return "hello world"


@app.route("/login", methods=["GET","POST"])
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


if __name__ == "__main__":
    app.run()
