from flask import Blueprint, request, jsonify, session, current_app
from app.models.user import User
from app import db
from werkzeug.security import generate_password_hash
import smtplib
from email.mime.text import MIMEText

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'msg': 'Missing fields'}), 400
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'msg': 'User already exists'}), 400
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'Register success'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'msg': 'Invalid credentials'}), 401
    session['user'] = username
    return jsonify({'msg': 'Login success', 'username': username}), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'msg': 'Logout success'}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'msg': 'Email not found'}), 404
    # Gửi email reset mật khẩu
    reset_link = f"http://localhost:3000/reset-password?email={email}"
    subject = "Password Reset Request"
    body = f"Click the link to reset your password: {reset_link}"
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = current_app.config.get('MAIL_FROM', 'noreply@example.com')
    msg['To'] = email
    try:
        with smtplib.SMTP(current_app.config.get('MAIL_SERVER', 'localhost'), current_app.config.get('MAIL_PORT', 25)) as server:
            if current_app.config.get('MAIL_USERNAME') and current_app.config.get('MAIL_PASSWORD'):
                server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
            server.sendmail(msg['From'], [email], msg.as_string())
    except Exception as e:
        return jsonify({'msg': f'Failed to send email: {str(e)}'}), 500
    return jsonify({'msg': 'Password reset link sent'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'msg': 'Email not found'}), 404
    user.set_password(password)
    db.session.commit()
    return jsonify({'msg': 'Password reset success'}), 200
