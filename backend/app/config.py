# Config placeholder

# Config for MySQL connection
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:password@localhost/PATHSEQ'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = 'app/uploads'
    RESULT_FOLDER = 'app/results'
    REFERENCE_FOLDER = 'app/reference_db'
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'localhost')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 25))
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_FROM = os.environ.get('MAIL_FROM', 'noreply@example.com')
