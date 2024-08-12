from app import app
from functools import wraps
from datetime import datetime, timedelta
from flask import (
    request,
    jsonify,
    render_template,
)
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    set_access_cookies,
    unset_jwt_cookies,
)
from application.models import db, Section, User, Books, Request, Issued, Feedbacks
from werkzeug.security import check_password_hash, generate_password_hash
from flask_caching import Cache
from application.tasks import export_user_data


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


# ----------------------------Home, Search------------------------------------#


@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


@app.route("/api/sections", methods=["GET"])
@auth_required
@cache.cached(30)
def get_all_sections():
    sections = Section.query.filter(Section.books.any()).all()

    section_data = [
        {
            "id": section.id,
            "name": section.name,
            "books": [
                {"id": book.id, "name": book.name, "author": book.author}
                for book in section.books
            ],
        }
        for section in sections
    ]
    return jsonify({"sections": section_data})


@app.route("/profile", methods=["GET", "POST"])
@auth_required
def profile():
    user_identity = get_jwt_identity()
    user_id = user_identity["user_id"]
    user = User.query.get(user_id)

    if request.method == "POST":
        data = request.json
        name = data.get("name")
        new_username = data.get("username")
        cpassword = data.get("cpassword")
        password = data.get("password")

        # Validate the request data
        if not name or not new_username or not cpassword or not password:
            return jsonify({"error": "Please fill out all the fields"}), 400

        if new_username != user.username:
            existing_user = User.query.filter_by(username=new_username).first()
            if existing_user:
                return jsonify({"error": "Username already exists"}), 400

        if not check_password_hash(user.passhash, cpassword):
            return jsonify({"error": "Current password does not match"}), 400

        if check_password_hash(user.passhash, password):
            return jsonify(
                {"error": "New password cannot be the same as the old password"}
            ), 400

        new_password_hash = generate_password_hash(password)
        user.username = new_username
        user.passhash = new_password_hash
        user.name = name
        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200

    elif request.method == "GET":
        if user:
            return jsonify({"username": user.username, "name": user.name}), 200
        return jsonify({"error": "User not found"}), 404


@app.route("/api/search")
@auth_required
def search():
    parameter = request.args.get("parameter")
    query = request.args.get("query")

    parameters = {
        "section_name": "Section Name",
        "book_name": "Book Name",
        "author_name": "Author Name",
    }

    if parameter not in parameters:
        return jsonify({"error": "Invalid parameter"}), 400

    sections = Section.query.filter(Section.books.any()).all()

    if parameter == "section_name":
        sections = Section.query.filter(Section.name.ilike(f"%{query}%")).all()
    elif parameter == "book_name":
        sections = [
            section
            for section in Section.query.all()
            if any(book for book in section.books if query.lower() in book.name.lower())
        ]
    elif parameter == "author_name":
        sections = [
            section
            for section in Section.query.all()
            if any(
                book for book in section.books if query.lower() in book.author.lower()
            )
        ]

    # Filter books within each section
    for section in sections:
        if parameter == "book_name":
            section.books = [
                book for book in section.books if query.lower() in book.name.lower()
            ]
        elif parameter == "author_name":
            section.books = [
                book for book in section.books if query.lower() in book.author.lower()
            ]

    return jsonify(
        {
            "sections": [
                {
                    "id": section.id,
                    "name": section.name,
                    "books": [
                        {"id": book.id, "name": book.name, "author": book.author}
                        for book in section.books
                    ],
                }
                for section in sections
            ]
        }
    )


# ----------------------------Register, Login and Logout------------------------------------#


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirm_password")

    if not name or not username or not email or not password or not confirm_password:
        return jsonify({"error": "Please fill out all the fields"}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"error": "User already exists"}), 409

    password_hash = generate_password_hash(password)
    new_user = User(
        username=username,
        passhash=password_hash,
        name=name,
        role="user",
        email=email,
        last_login=datetime.utcnow(),
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Registered successfully."}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"message": "User doesn't exist, register first"}), 404

    if not check_password_hash(user.passhash, password):
        return jsonify({"message": "Incorrect password"}), 401

    access_token = create_access_token(
        identity={"user_id": user.id, "username": user.username, "role": user.role}
    )
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
@cache.cached(30)
def admin_home():
    sections = Section.query.all()
    section_data = [
        {"id": section.id, "name": section.name, "size": len(section.books)}
        for section in sections
    ]
    return jsonify(section_data), 200


@app.route("/admin/dashboard", methods=["GET"])
@admin_required
def admin_dashboard():
    # Retrieve statistics
    active_users_count = User.query.count()
    grant_requests_count = Request.query.count()
    issued_books_count = Issued.query.count()
    revoked_books_count = Books.query.filter_by(
        is_revoked=True
    ).count()  # Count based on the new field

    # Create response data
    dashboard_data = {
        "active_users": active_users_count,
        "grant_requests": grant_requests_count,
        "issued_books": issued_books_count,
        "revoked_books": revoked_books_count,
    }

    return jsonify(dashboard_data)


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
@cache.cached(30)
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


@app.route("/book/<int:id>/show", methods=["GET"])
# @auth_required
@cache.cached(30)
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


# ----------------------------Admin View Request, Grant, Reject and Revoke------------------------------------#


@app.route("/requests", methods=["GET"])
@admin_required
def requests():
    requests = Request.query.all()
    request_list = [
        {
            "id": req.id,
            "user_id": req.user_id,
            "username": req.username,
            "duration": req.duration,
            "book": {
                "name": req.book.name,
                "author": req.book.author,
            },
        }
        for req in requests
    ]
    return jsonify({"requests": request_list})


@app.route("/requests/grant/<int:id>", methods=["POST"])
@admin_required
def grant_request(id):
    request_to_grant = Request.query.get(id)

    if not request_to_grant:
        return jsonify({"error": "Request does not exist"}), 404

    # Calculate dates
    date_issued = datetime.utcnow()
    return_date = date_issued + timedelta(days=request_to_grant.duration)

    # Create Issued record
    issuance = Issued(
        user_id=request_to_grant.user_id,
        book_id=request_to_grant.book_id,
        username=request_to_grant.username,
        book_name=request_to_grant.book.name,
        author=request_to_grant.book.author,
        date_issued=date_issued,
        return_date=return_date,
    )

    db.session.add(issuance)
    db.session.delete(request_to_grant)
    db.session.commit()

    return jsonify({"message": "Request granted successfully"}), 200


@app.route("/requests/reject/<int:id>", methods=["POST"])
@admin_required
def reject_request(id):
    request_to_reject = Request.query.get(id)

    if not request_to_reject:
        return jsonify({"error": "Request does not exist"}), 404

    # request_to_reject.status = "rejected"
    db.session.delete(request_to_reject)
    db.session.commit()
    return jsonify({"message": "Request rejected successfully"}), 200


@app.route("/issued_books", methods=["GET"])
@admin_required
def issued_books():
    all_issued = Issued.query.all()
    issued_books = [
        {
            "id": issued.id,
            "user_id": issued.user_id,
            "book_id": issued.book_id,
            "username": issued.username,
            "book_name": issued.book_name,
            "author": issued.author,
            "date_issued": issued.date_issued.isoformat(),
            "return_date": issued.return_date.isoformat(),
        }
        for issued in all_issued
    ]
    return jsonify({"issuedBooks": issued_books})


@app.route("/revoke_book/<int:book_id>/<int:user_id>", methods=["POST"])
@admin_required
def revoke_book(book_id, user_id):
    revoke_book = Issued.query.filter_by(user_id=user_id, book_id=book_id).first()

    if not revoke_book:
        return jsonify({"message": "Book not found or not issued to the user"}), 404

    revoke_status = Books.query.filter_by(id=book_id, is_revoked=False).first()

    if revoke_status:
        revoke_status.is_revoked = True

    db.session.delete(revoke_book)
    db.session.commit()

    return jsonify({"message": "Book revoked successfully."})


# ----------------------------User Book Request, Library------------------------------------#


@app.route("/requestBook/<int:book_id>", methods=["POST"])
@auth_required
def request_book(book_id):
    book = Books.query.get(book_id)

    if not book:
        return jsonify({"error": "Book does not exist"}), 404

    book.date_issued = datetime.now()

    duration = request.json.get("duration")
    if not duration or not isinstance(duration, int):
        return jsonify({"error": "Invalid duration"}), 400

    book.return_date = datetime.now() + timedelta(days=duration)

    identity = get_jwt_identity()
    user_id = identity["user_id"]
    username = identity["username"]

    # Check request size
    request_size = Request.query.filter_by(user_id=user_id).count()
    if request_size >= 5:
        return jsonify({"error": "You cannot request for more than 5 books."}), 403

    issued_book = Issued.query.filter_by(user_id=user_id, book_id=book_id).first()

    if issued_book:
        return jsonify({"error": "You already have this book in your library."}), 409

    # Check if an item with the same user_id and book_id already exists
    request_item = Request.query.filter_by(user_id=user_id, book_id=book_id).first()

    if request_item:  # If the book already exists in the request list
        return jsonify({"error": "You have already requested for this book."}), 409
    else:  # If the book is new to the request list
        new_request_item = Request(
            user_id=user_id,
            book_id=book_id,
            username=username,
            duration=duration,  # Save the duration
        )
        db.session.add(new_request_item)
        db.session.commit()
        return jsonify({"message": "Requested book successfully!"}), 201


@app.route("/issued_books_user")
@auth_required
def issued_books_user():
    identity = get_jwt_identity()
    user_id = identity["user_id"]
    all_issued = Issued.query.filter_by(user_id=user_id).all()
    issued_books = [
        {
            "id": issued.id,
            "book_id": issued.book_id,
            "book_name": issued.book_name,
            "author": issued.author,
            "date_issued": issued.date_issued.isoformat(),
            "return_date": issued.return_date.isoformat(),
        }
        for issued in all_issued
    ]
    return jsonify({"issuedBooks": issued_books})


@app.route("/return_book/<int:id>", methods=["POST"])
@jwt_required()
def return_book(id):
    # Get the user_id from JWT
    identity = get_jwt_identity()
    user_id = identity["user_id"]

    # Fetch the issued book entry
    return_book = Issued.query.filter_by(user_id=user_id, book_id=id).first()

    if not return_book:
        return jsonify({"message": "Book not found or not issued to the user"}), 404

    # Delete the issued book entry
    db.session.delete(return_book)
    db.session.commit()

    return jsonify({"message": "Book returned successfully."})


# ----------------------------Feedbacks------------------------------------#


@app.route("/give_feedbacks_data/<int:id>")
@auth_required
def give_feedbacks_data(id):
    return jsonify({"book_id": id})


@app.route("/give_feedbacks_post/<int:id>", methods=["POST"])
@auth_required
def give_feedbacks_post(id):
    # Get feedback from JSON request
    feedback = request.json.get("feedback")
    rating = request.json.get("rating", 0)

    if not feedback:
        return jsonify({"message": "Feedback is required."}), 400

    if rating is not None and (rating < 1 or rating > 5):
        return jsonify({"message": "Rating must be between 1 and 5"}), 400

    # Fetch the book information
    info = Books.query.get(id)
    if not info:
        return jsonify({"message": "Book not found."}), 404

    identity = get_jwt_identity()
    user_id = identity["user_id"]
    username = identity["username"]

    # Create a new feedback entry
    book_feedback = Feedbacks(
        user_id=user_id,
        book_id=id,
        username=username,
        book_name=info.name,
        author=info.author,
        feedback=feedback,
        date_of_feedback=datetime.now(),
        rating=rating,
    )
    db.session.add(book_feedback)
    db.session.commit()

    return jsonify({"message": "Feedback given successfully."}), 200


@app.route("/user_feedbacks", methods=["GET"])
# @admin_required
def user_feedbacks():
    feedbacks = Feedbacks.query.all()
    feedbacks_data = [
        {
            "id": feedback.id,
            "book_name": feedback.book_name,
            "author": feedback.author,
            "user_id": feedback.user_id,
            "username": feedback.username,
            "date_of_feedback": feedback.date_of_feedback.isoformat(),
            "feedback": feedback.feedback,
            "rating": feedback.rating,
        }
        for feedback in feedbacks
    ]

    return jsonify({"feedbacks": feedbacks_data})


@app.route("/rate_book/<int:book_id>", methods=["POST"])
@auth_required
def rate_book(book_id):
    data = request.json
    rating = data.get("rating")

    if not rating or not (1 <= rating <= 5):
        return jsonify(
            {"message": "Invalid rating. Please provide a rating between 1 and 5."}
        ), 400

    try:
        issued_record = Issued.query.filter_by(book_id=book_id).first()
        if not issued_record:
            return jsonify({"message": "Issued record not found."}), 404

        issued_record.rating = rating
        db.session.commit()

        return jsonify({"message": "Rating updated successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating rating.", "error": str(e)}), 500


# @app.route("/book_feedbacks/<int:book_id>", methods=["GET"])
# @auth_required
# def book_feedbacks(book_id):
#     feedbacks = Feedbacks.query.filter_by(book_id=book_id).all()
#     feedbacks_data = [
#         {
#             "id": feedback.id,
#             "book_name": feedback.book_name,
#             "author": feedback.author,
#             "user_id": feedback.user_id,
#             "username": feedback.username,
#             "date_of_feedback": feedback.date_of_feedback.isoformat(),
#             "feedback": feedback.feedback,
#         }
#         for feedback in feedbacks
#     ]

#     return jsonify({"feedbacks": feedbacks_data})


@app.route("/trigger_export", methods=["POST"])
@auth_required
def trigger_export():
    identity = get_jwt_identity()
    user_id = identity["user_id"]

    # Trigger the export task asynchronously for this specific user
    export_user_data.delay(user_id)

    return jsonify(
        {
            "message": "Your export job has been started. You will receive an email shortly with your book details export."
        }
    ), 200
