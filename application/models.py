from app import app
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    username = db.Column(db.String(32), unique=True)
    passhash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    role = db.Column(db.String(64), nullable=False)


class Section(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), nullable=False, unique=True)
    books = db.relationship(
        "Books", backref="section", lazy=True, cascade="all, delete-orphan"
    )


class Books(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(64), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey("section.id"), nullable=False)

    carts = db.relationship("Cart", backref="book", lazy=True)
    issued = db.relationship(
        "Issued", backref="books", lazy=True, cascade="all, delete-orphan"
    )


class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    username = db.Column(db.String(32), db.ForeignKey("user.username"), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)


class Issued(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)
    username = db.Column(db.String(32), nullable=False)
    book_name = db.Column(db.String(32), nullable=False)
    author = db.Column(db.String(64), nullable=False)
    date_issued = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=False)


# keeping the data of feedbacks separately because the
# feedbacks would remain even if the books are deleted
class Feedbacks(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)
    username = db.Column(db.String(32), nullable=False)
    book_name = db.Column(db.String(32), nullable=False)
    author = db.Column(db.String(64), nullable=False)
    date_of_feedback = db.Column(db.Date, nullable=False)
    feedback = db.Column(db.Text, nullable=False)


with app.app_context():
    db.create_all()
    # if an admin does not exist
    admin = User.query.filter_by(is_admin=True).first()
    if not admin:
        password_hash = generate_password_hash("admin")
        admin = User(
            name="admin",
            username="admin",
            passhash=password_hash,
            is_admin=True,
            role="admin",
        )
    db.session.add(admin)
    db.session.commit()
