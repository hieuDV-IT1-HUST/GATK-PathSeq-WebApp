from pathlib import Path
from flask import Blueprint, request, jsonify, current_app
import os
import subprocess
import threading
import uuid
import json

pathseq_bp = Blueprint('pathseq', __name__)

def run_pathseq_job(job_id, job_info, cmd, output_files):
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60*60*24)
        log = proc.stdout + '\n' + proc.stderr
        outputs = {}
        for f in output_files:
            if os.path.exists(f):
                outputs[os.path.basename(f)] = f
        status = "success" if proc.returncode == 0 else "failed"
    except Exception as e:
        log = str(e)
        outputs = {}
        status = "failed"
    job_info.update({"status": status, "log": log, "outputs": outputs})
    with open(f"jobs/{job_id}.json", "w") as f:
        json.dump(job_info, f)

@pathseq_bp.route('/run', methods=['POST'])
def run_pathseq():
    data = request.json
    user = data.get('user')
    session_id = data.get('session_id')
    # Các tham số bắt buộc
    input_bam = data.get('input')
    host_img = data.get('host_img')
    host_hss = data.get('host_hss')
    host_fasta = data.get('host_fasta')
    microbe_dict = data.get('microbe_dict')
    microbe_img = data.get('microbe_img')
    taxonomy_db = data.get('taxonomy_db')
    output_name = data.get('output_name')
    gatk_version = data.get('gatk_version', '4.2.0.0')
    extra_flags = data.get('extra_flags', [])  # List[str]

    # Validate
    if not all([user, input_bam, host_img, host_hss, host_fasta, microbe_dict, microbe_img, taxonomy_db]):
        return jsonify({'error': 'Thiếu tham số bắt buộc!'}), 400

    # Đường dẫn tuyệt đối
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    input_bam_path = Path('uploads') / user / session_id / 'input' / input_bam
    host_img_path = Path('uploads') / user / session_id / 'reference_db' / 'host' / host_img
    host_hss_path = Path('uploads') / user / session_id / 'reference_db' / 'host' / host_hss
    host_fasta_path = Path('uploads') / user / session_id / 'reference_db' / 'host' / host_fasta
    microbe_dict_path = Path('uploads') / user / session_id / 'reference_db' / 'microbe_db' / microbe_dict
    microbe_img_path = Path('uploads') / user / session_id / 'reference_db' / 'microbe_db' / microbe_img
    taxonomy_db_path = Path('uploads') / user / session_id / 'reference_db' / 'taxonomy_db' / taxonomy_db

    # Thư mục output
    results_dir = os.path.join(base_dir, 'results', user, session_id)
    os.makedirs(results_dir, exist_ok=True)

    # Tên output
    if not output_name:
        microbe_db_name = os.path.splitext(os.path.basename(microbe_dict))[0]
        output_prefix = f"output.pathseq.{microbe_db_name}"
    else:
        output_prefix = output_name
    output_bam = os.path.join(results_dir, f"{output_prefix}.bam")
    output_txt = os.path.join(results_dir, f"{output_prefix}.txt")
    output_sbi = os.path.join(results_dir, f"{output_prefix}.bam.sbi")

    # Chọn image Docker theo version
    docker_image = f'broadinstitute/gatk:{gatk_version}'

    # Build lệnh GATK
    cmd = [
        'docker', 'run', '--rm',
        '-v', f'{base_dir}/uploads:/data/uploads',
        '-v', f'{base_dir}/results:/data/results',
        docker_image,
        'gatk', 'PathSeqPipelineSpark',
        '--input', f'/data/{input_bam_path.as_posix()}',
        '--filter-bwa-image', f'/data/{host_img_path.as_posix()}',
        '--kmer-file', f'/data/{host_hss_path.as_posix()}',
        '--microbe-dict', f'/data/{microbe_dict_path.as_posix()}',
        '--microbe-bwa-image', f'/data/{microbe_img_path.as_posix()}',
        '--taxonomy-file', f'/data/{taxonomy_db_path.as_posix()}',
        '--output', f'/data/results/{user}/{session_id}/{output_prefix}.bam',
        '--scores-output', f'/data/results/{user}/{session_id}/{output_prefix}.txt',
    ]
    if extra_flags:
        cmd.extend(extra_flags)

    job_id = str(uuid.uuid4())
    job_info = {
        "status": "pending",
        "log": "",
        "outputs": {},
        "user": user,
        "session_id": session_id,
        "output_prefix": output_prefix
    }
    os.makedirs("jobs", exist_ok=True)
    with open(f"jobs/{job_id}.json", "w") as f:
        json.dump(job_info, f)
    output_files = [output_bam, output_txt, output_sbi]
    t = threading.Thread(target=run_pathseq_job, args=(job_id, job_info, cmd, output_files))
    t.start()
    return jsonify({"job_id": job_id, "status": "pending"})

@pathseq_bp.route('/status', methods=['GET'])
def job_status():
    job_id = request.args.get("job_id")
    try:
        with open(f"jobs/{job_id}.json") as f:
            job_info = json.load(f)
        return jsonify(job_info)
    except Exception:
        return jsonify({"status": "not_found"}), 404
