from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from app.config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    # Import models sau khi init_app để tránh circular import
    from app.models import user

    # Đăng ký blueprint
    from app.api.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    return app
