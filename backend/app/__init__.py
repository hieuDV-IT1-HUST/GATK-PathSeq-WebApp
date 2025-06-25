from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
load_dotenv('.env')
from app.config import Config
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    CORS(app, supports_credentials=True)

    from app.api.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from app.api.files import files_bp
    app.register_blueprint(files_bp, url_prefix='/api/files')
    
    from app.api.pathseq import pathseq_bp
    app.register_blueprint(pathseq_bp, url_prefix='/api/pathseq')

    return app
