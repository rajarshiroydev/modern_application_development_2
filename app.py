from flask import Flask, request
from flask_jwt_extended import JWTManager

# from flask_cors import CORS
from flask_caching import Cache
# import os

# create app
app = Flask(__name__)
# CORS(app)

# configure app
app.config["CACHE_TYPE"] = "redis"
app.config["CACHE_REDIS_HOST"] = "localhost"
app.config["CACHE_REDIS_PORT"] = 6379
app.config["CACHE_REDIS_DB"] = 0
app.config["CACHE_REDIS_URL"] = "redis://localhost:6379/0"
app.config["CACHE_DEFAULT_TIMEOUT"] = 300


app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SECURITY_PASSWORD_SALT"] = "salty-password"
app.config["SECURITY_TOKEN_AUTHENTICATION_HEADER"] = "Authentication-Token"
app.config["JWT_SECRET_KEY"] = "mad2_project"


cache = Cache(app)

# Initialize JWT
jwt = JWTManager(app)

# importing models and routes
import application.models
import application.routes


@app.before_request
def clear_cache_for_non_get():
    if request.method != "GET":
        cache.clear()
        pass


if __name__ == "__main__":
    app.run(debug=True)
