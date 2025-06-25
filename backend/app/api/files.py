from flask import Blueprint, request, jsonify, session, send_file
import os
from werkzeug.utils import secure_filename

files_bp = Blueprint('files', __name__)

INPUT_FOLDER = 'uploads'
HOST_FOLDER = 'uploads'
MICROBE_DB_FOLDER = 'uploads'
TAXONOMY_DB_FOLDER = 'uploads'

ALLOWED_INPUT_EXTENSIONS = {'bam', 'fastq', 'fq', 'gz'}
ALLOWED_HOST_EXTENSIONS = {'fasta', 'img', 'hss'}
ALLOWED_MICROBE_EXTENSIONS = {
    'fna', 'fna.gz', 'fasta', 'gz', 'db', 'dict', 'amb', 'ann', 'bwt', 'fai', 'img', 'pac', 'sa'
}
ALLOWED_TAXONOMY_EXTENSIONS = {'catalog.gz', 'tar.gz', 'db'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_INPUT_EXTENSIONS

def allowed_file_ext(filename, allowed_exts):
    ext = filename.lower().split('.')
    if len(ext) < 2:
        return False
    if ext[-1] in allowed_exts:
        return True
    if len(ext) > 2 and (ext[-2] + '.' + ext[-1]) in allowed_exts:
        return True
    return False

@files_bp.route('/upload/input', methods=['POST'])
def upload_input_file():
    if 'file' not in request.files:
        return jsonify({'msg': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400
    if not allowed_file(file.filename):
        return jsonify({'msg': 'Invalid file type'}), 400
    username = request.form.get('user') or session.get('user', 'anonymous')
    session_id = request.form.get('session_id', 'default')
    user_folder = os.path.join(INPUT_FOLDER, username, session_id, 'input')
    os.makedirs(user_folder, exist_ok=True)
    filename = secure_filename(file.filename)
    file_path = os.path.join(user_folder, filename)
    file.save(file_path)
    # print(f"UPLOAD: user={username}, session_id={session_id}", file=sys.stderr)
    return jsonify({'msg': 'File uploaded', 'filename': filename, 'path': file_path}), 200

@files_bp.route('/upload/host', methods=['POST'])
def upload_host_file():
    if 'file' not in request.files:
        return jsonify({'msg': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400
    if not allowed_file_ext(file.filename, ALLOWED_HOST_EXTENSIONS):
        return jsonify({'msg': 'Invalid file type'}), 400
    username = request.form.get('user') or session.get('user', 'anonymous')
    session_id = request.form.get('session_id', 'default')
    user_folder = os.path.join(HOST_FOLDER, username, session_id, 'reference_db', 'host')
    os.makedirs(user_folder, exist_ok=True)
    filename = secure_filename(file.filename)
    file_path = os.path.join(user_folder, filename)
    file.save(file_path)
    # print(f"UPLOAD: user={username}, session_id={session_id}", file=sys.stderr)
    return jsonify({'msg': 'Host file uploaded', 'filename': filename, 'path': file_path}), 200

@files_bp.route('/upload/microbe-db', methods=['POST'])
def upload_microbe_db_file():
    if 'file' not in request.files:
        return jsonify({'msg': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400
    if not allowed_file_ext(file.filename, ALLOWED_MICROBE_EXTENSIONS):
        return jsonify({'msg': 'Invalid file type'}), 400
    username = request.form.get('user') or session.get('user', 'anonymous')
    session_id = request.form.get('session_id', 'default')
    user_folder = os.path.join(MICROBE_DB_FOLDER, username, session_id, 'reference_db', 'microbe_db')
    os.makedirs(user_folder, exist_ok=True)
    filename = secure_filename(file.filename)
    file_path = os.path.join(user_folder, filename)
    file.save(file_path)
    # print(f"UPLOAD: user={username}, session_id={session_id}", file=sys.stderr)
    return jsonify({'msg': 'Microbe DB file uploaded', 'filename': filename, 'path': file_path}), 200

@files_bp.route('/upload/taxonomy-db', methods=['POST'])
def upload_taxonomy_db_file():
    if 'file' not in request.files:
        return jsonify({'msg': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400
    if not allowed_file_ext(file.filename, ALLOWED_TAXONOMY_EXTENSIONS):
        return jsonify({'msg': 'Invalid file type'}), 400
    username = request.form.get('user') or session.get('user', 'anonymous')
    session_id = request.form.get('session_id', 'default')
    user_folder = os.path.join(TAXONOMY_DB_FOLDER, username, session_id, 'reference_db', 'taxonomy_db')
    os.makedirs(user_folder, exist_ok=True)
    filename = secure_filename(file.filename)
    file_path = os.path.join(user_folder, filename)
    file.save(file_path)
    # print(f"UPLOAD: user={username}, session_id={session_id}", file=sys.stderr)
    return jsonify({'msg': 'Taxonomy DB file uploaded', 'filename': filename, 'path': file_path}), 200

@files_bp.route('/download', methods=['GET'])
def download_result_file():
    """
    API tải file kết quả theo user, session_id, file
    /api/download?user=xxx&session_id=yyy&file=zzz
    """
    user = request.args.get('user')
    session_id = request.args.get('session_id')
    filename = request.args.get('file')
    if not all([user, session_id, filename]):
        return jsonify({'error': 'Thiếu tham số!'}), 400
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    file_path = os.path.join(base_dir, 'results', user, session_id, filename)
    print(f"DOWNLOAD: {file_path}", flush=True)
    if not os.path.exists(file_path):
        return jsonify({'error': 'Không tìm thấy file!'}), 404
    return send_file(file_path, as_attachment=True)

@files_bp.route('/upload/cleanup', methods=['POST'])
def cleanup_user_files():
    username = request.form.get('user') or session.get('user', 'anonymous')
    session_id = None
    if request.is_json:
        session_id = request.json.get('session_id')
    elif 'session_id' in request.form:
        session_id = request.form.get('session_id')
    else:
        try:
            import json
            data = request.get_data(as_text=True)
            if data:
                session_id = json.loads(data).get('session_id')
        except Exception:
            session_id = 'default'
    if not session_id:
        session_id = 'default'
    # Xóa tất cả file trong các thư mục liên quan đến user/session_id
    session_root = os.path.join(INPUT_FOLDER, username, session_id)
    host_root = os.path.join(HOST_FOLDER, username, session_id, 'reference_db', 'host')
    microbe_root = os.path.join(MICROBE_DB_FOLDER, username, session_id, 'reference_db', 'microbe_db')
    taxonomy_root = os.path.join(TAXONOMY_DB_FOLDER, username, session_id, 'reference_db', 'taxonomy_db')
    results_root = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'results', username, session_id)
    deleted = []
    # Xóa toàn bộ thư mục session_id trong uploads và results
    for folder in [session_root, host_root, microbe_root, taxonomy_root, results_root]:
        if os.path.exists(folder):
            try:
                import shutil
                shutil.rmtree(folder)
                deleted.append(folder)
            except Exception:
                pass
    # Nếu tất cả session_id đã bị xóa, thử xóa luôn thư mục user nếu rỗng
    user_root = os.path.join(INPUT_FOLDER, username)
    try:
        if os.path.exists(user_root) and not os.listdir(user_root):
            os.rmdir(user_root)
    except Exception:
        pass
    return jsonify({'msg': 'Đã xóa toàn bộ file đã upload', 'deleted': deleted}), 200

@files_bp.route('/list', methods=['GET'])
def list_uploaded_files():
    """
    API lấy danh sách file đã upload theo username và session_id
    Truyền lên dạng ?user=xxx&session_id=yyy
    """
    username = request.args.get('user', session.get('user', 'anonymous'))
    session_id = request.args.get('session_id', 'default')
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    def list_files(folder):
        path = os.path.join(base_dir, folder)
        # print(f"CHECK DIR: {path}", file=sys.stderr)
        if os.path.exists(path):
            return sorted([f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f))])
        return []
    input_dir = os.path.join('uploads', username, session_id, 'input')
    host_dir = os.path.join('uploads', username, session_id, 'reference_db', 'host')
    microbe_dir = os.path.join('uploads', username, session_id, 'reference_db', 'microbe_db')
    taxonomy_dir = os.path.join('uploads', username, session_id, 'reference_db', 'taxonomy_db')
    # print(f"LIST: user={username}, session_id={session_id}", file=sys.stderr)
    return jsonify({
        'input': list_files(input_dir),
        'host': list_files(host_dir),
        'microbe': list_files(microbe_dir),
        'taxonomy': list_files(taxonomy_dir),
    })
