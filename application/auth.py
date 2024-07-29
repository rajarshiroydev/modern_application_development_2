from flask import jsonify, request
from application.models import User
from flask import current_app as app
from werkzeug.security import check_password_hash


@app.route("/login", methods=["POST"])
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
