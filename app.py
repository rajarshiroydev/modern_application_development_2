from flask import Flask
from application.models import db
from config import DevelopmentConfig


def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    with app.app_context():
        import application.auth
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

    return app


# app = create_app()

# if __name__ == "__main__":
#     app.run(debug=True)
