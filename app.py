from flask import Flask

# create app
app = Flask(__name__)

# configure app
app.config["DEBUG"] = True
app.config["SECRET_KEY"] = "should-not-be-seen"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SECURITY_PASSWORD_SALT"] = "salty-password"
app.config["SECURITY_TOKEN_AUTHENTICATION_HEADER"] = "Authentication-Token"

# importing models and routes
import application.models
import application.routes


if __name__ == "__main__":
    app.run(debug=True)
