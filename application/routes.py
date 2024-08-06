from app import app
from functools import wraps
from flask import request, jsonify, render_template, session, redirect, url_for, flash
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    set_access_cookies,
    unset_jwt_cookies,
)
from application.models import db, Section, User, Books, Cart, Issued, Feedbacks
from werkzeug.security import check_password_hash, generate_password_hash
from flask_caching import Cache


jwt = JWTManager()
cache = Cache(app)


# ----------------------------Role based access------------------------------------#


def auth_required(func):
    @wraps(func)
    @jwt_required()
    def wrapper(*args, **kwargs):
        # You have to pass identity to get_jwt_identity and check it
        identity = get_jwt_identity()
        if identity:
            return func(*args, **kwargs)
        else:
            return jsonify({"message": "Unauthorized access"}), 401

    return wrapper


def admin_required(func):
    @wraps(func)
    @jwt_required()
    def wrapper(*args, **kwargs):
        identity = get_jwt_identity()
        if identity and identity.get("role") == "admin":
            return func(*args, **kwargs)
        else:
            return jsonify({"message": "Unauthorized access"}), 403

    return wrapper


# ----------------------------Home------------------------------------#


@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


# ----------------------------Register, Login and Logout------------------------------------#


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
    new_user = User(username=username, passhash=password_hash, name=name, role="user")
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Registered successfully."}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(username=username).first()

    if user is None or not check_password_hash(user.passhash, password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity={"user_id": user.id, "role": user.role})
    response = jsonify({"access_token": access_token, "role": user.role})
    set_access_cookies(response, access_token)
    return response


@app.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    response = jsonify({"message": "Successfully logged out"})
    unset_jwt_cookies(response)
    return response, 200


# ------------------------------Admin & Sections------------------------------------#


@app.route("/adminhome")
@admin_required
@cache.cached(300)
def admin_home():
    sections = Section.query.all()
    section_data = [
        {"id": section.id, "name": section.name, "size": len(section.books)}
        for section in sections
    ]
    return jsonify(section_data), 200


@app.route("/unauthorized")
def unauthorized():
    return jsonify({"message": "Unauthorized access"}), 403


@app.route("/userhome")
@auth_required
def user_home():
    return "hello, world"


@app.route("/section/add", methods=["GET"])
@auth_required
def add_section():
    return render_template("/section/add.html")


@app.route("/section/add", methods=["POST"])
@auth_required
def add_section_post():
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"error": "Please fill out all the fields"}), 400

    section = Section(name=name)
    db.session.add(section)
    db.session.commit()

    return jsonify({"message": "Section created successfully"}), 201


@app.route("/api/section/<int:id>", methods=["GET"])
@admin_required
def get_section(id):
    section = Section.query.get(id)
    if not section:
        return jsonify({"error": "Section does not exist"}), 404
    return jsonify(
        {
            "id": section.id,
            "name": section.name,
        }
    )


@app.route("/api/section/<int:id>", methods=["PUT"])
@admin_required
def edit_section(id):
    data = request.get_json()
    section = Section.query.get(id)
    if not section:
        return jsonify({"error": "Section does not exist"}), 404

    if "name" in data:
        section.name = data["name"]

    db.session.commit()
    return jsonify({"message": "Section updated successfully"})


@app.route("/api/section/<int:id>", methods=["DELETE"])
@admin_required
def delete_section(id):
    section = Section.query.get(id)
    if not section:
        return jsonify({"error": "Section does not exist"}), 404

    db.session.delete(section)
    db.session.commit()
    return jsonify({"message": "Section deleted successfully"}), 200


@app.route("/section/<int:id>/show")
@admin_required
def show_section(id):
    section = Section.query.get(id)
    if not section:
        return jsonify({"error": "Section does not exist"}), 404

    books = [
        {"id": book.id, "name": book.name, "author": book.author}
        for book in section.books
    ]
    return jsonify({"id": section.id, "name": section.name, "books": books}), 200


@app.route("/book/add", methods=["POST"])
@admin_required
def add_book():
    data = request.get_json()
    name = data.get("name")
    content = data.get("content")
    author = data.get("author")
    section_id = data.get("section_id")

    section = Section.query.get(section_id)

    if not section:
        return jsonify({"error": "Section does not exist"}), 404

    if not name or not content or not author:
        return jsonify({"error": "All fields are mandatory"}), 400

    book = Books(name=name, content=content, author=author, section_id=section_id)

    db.session.add(book)
    db.session.commit()

    return jsonify({"message": "Book added successfully"}), 201


@app.route("/api/book/<int:id>/show", methods=["GET"])
# @auth_required
def read_book(id):
    book = Books.query.get(id)
    if not book:
        return jsonify({"error": "No such book exists"}), 404
    book_data = {
        "name": book.name,
        "content": book.content,
        "author": book.author,
    }
    return jsonify({"book": book_data})


@app.route("/api/book/<int:id>/edit", methods=["GET"])
@admin_required
def get_book(id):
    book = Books.query.get(id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    sections = Section.query.all()
    sections_list = [{"id": section.id, "name": section.name} for section in sections]

    book_data = {
        "name": book.name,
        "content": book.content,
        "author": book.author,
        "section_id": book.section_id,
    }

    return jsonify({"book": book_data, "sections": sections_list})


@app.route("/api/book/<int:id>/edit", methods=["PUT"])
@admin_required
def edit_book_post(id):
    data = request.json
    name = data.get("name")
    content = data.get("content")
    author = data.get("author")
    section_id = data.get("section_id")

    if not name or not content or not author or not section_id:
        return jsonify({"error": "All fields are mandatory"}), 400

    section = Section.query.get(section_id)
    if not section:
        return jsonify({"error": "Section does not exist"}), 400

    book = Books.query.get(id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    book.name = name
    book.content = content
    book.author = author
    book.section_id = section_id

    # edits the book and author name in issued books
    issued_books = Issued.query.get(id)
    if issued_books:
        issued_books.book_name = name
        issued_books.author = author

    # edits the book and author name in feedbacks
    feedback = Feedbacks.query.get(id)
    if feedback:
        feedback.book_name = name
        feedback.author = author

    db.session.commit()

    return jsonify({"message": "Book edited successfully"})


@app.route("/api/book/<int:id>", methods=["DELETE"])
@admin_required
def delete_book(id):
    book = Books.query.get(id)

    if not book:
        return jsonify({"error": "Book does not exist"}), 404

    section_id = book.section_id

    db.session.delete(book)
    db.session.commit()

    return jsonify(
        {"message": "Book deleted successfully", "section_id": section_id}
    ), 200
