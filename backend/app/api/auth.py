from flask import Blueprint, request, jsonify, session, current_app
from app.models.user import User
from app import db
from werkzeug.security import generate_password_hash
import smtplib
from email.mime.text import MIMEText
import uuid

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
    session_id = str(uuid.uuid4())
    session['session_id'] = session_id
    return jsonify({'msg': 'Login success', 'username': username, 'session_id': session_id}), 200

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
    
    reset_link = f"http://localhost:3000/reset-password?email={email}"
    subject = "Password Reset Request"
    body = f'''
    <div style="max-width:420px;margin:32px auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;font-family:sans-serif;box-shadow:0 2px 8px #0001;">
      <h2 style="color:#2563eb;text-align:center;margin-bottom:16px;">Đặt lại mật khẩu</h2>
      <p style="color:#222;text-align:center;margin-bottom:24px;">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="{reset_link}" style="display:inline-block;padding:12px 32px;background:#2563eb;color:#fff;text-decoration:none;font-weight:bold;border-radius:8px;font-size:16px;">Đặt lại mật khẩu</a>
      </div>
      <p style="color:#666;font-size:13px;text-align:center;">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    </div>
    '''
    msg = MIMEText(body, "html")
    msg['Subject'] = subject
    msg['From'] = current_app.config.get('MAIL_FROM', 'noreply@example.com')
    msg['To'] = email
    try:
        with smtplib.SMTP(current_app.config.get('MAIL_SERVER', 'localhost'), current_app.config.get('MAIL_PORT', 25)) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
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
