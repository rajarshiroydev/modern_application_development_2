from flask import render_template


def create_view(app):
    @app.route("/")
    def home():
        return render_template("index.html") #entry point to vue frontend
