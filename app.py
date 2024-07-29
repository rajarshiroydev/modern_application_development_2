from flask import Flask
from extensions import db
import views


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = "this_is_secret_key"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECURITY_PASSWORD_SALT"] = "this_is_salt"

    db.init_app(app)

    with app.app_context():
        from application.models import User

        db.create_all()

        # if an admin does not exist
        admin = User.query.filter_by(is_admin=True).first()
        if not admin:
            from werkzeug.security import generate_password_hash

            password_hash = generate_password_hash("admin")
            admin = User(
                name="admin", username="admin", passhash=password_hash, is_admin=True
            )
            db.session.add(admin)
            db.session.commit()

    views.create_view(app)
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
