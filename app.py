from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# create app
app = Flask(__name__)
CORS(app)

# configure app
app.config["DEBUG"] = True
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SECURITY_PASSWORD_SALT"] = "salty-password"
app.config["SECURITY_TOKEN_AUTHENTICATION_HEADER"] = "Authentication-Token"
app.config["JWT_SECRET_KEY"] = "mad2_project"

# Initialize JWT
jwt = JWTManager(app)

# importing models and routes
import application.models
import application.routes

if __name__ == "__main__":
    # Explicitly set debug mode
    app.run(debug=True)
