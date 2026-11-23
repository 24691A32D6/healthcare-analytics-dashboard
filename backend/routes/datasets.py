import os
import pandas as pd
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from config import Config

datasets_bp = Blueprint('datasets', __name__)

ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@datasets_bp.route('/list', methods=['GET'])
def list_datasets():
    """Lists preloaded benchmark datasets and user-uploaded datasets."""
    bundled = [
        {'id': 'patients_seed.csv', 'name': 'Patient Demographics & Vitals (160 Records)', 'type': 'Bundled', 'records': 160},
        {'id': 'diabetes_data.csv', 'name': 'Diabetes Risk Benchmark Dataset (1,000 Records)', 'type': 'Bundled', 'records': 1000},
        {'id': 'heart_disease_data.csv', 'name': 'Heart Disease Risk Benchmark Dataset (1,000 Records)', 'type': 'Bundled', 'records': 1000}
    ]

    uploads = []
    if os.path.exists(Config.UPLOAD_DIR):
        for f in os.listdir(Config.UPLOAD_DIR):
            if f.endswith('.csv'):
                p = os.path.join(Config.UPLOAD_DIR, f)
                try:
                    df = pd.read_csv(p)
                    uploads.append({
                        'id': f,
                        'name': f,
                        'type': 'Uploaded',
                        'records': len(df)
                    })
                except Exception:
                    pass

    return jsonify({'success': True, 'datasets': bundled + uploads})

@datasets_bp.route('/preview/<dataset_id>', methods=['GET'])
def preview_dataset(dataset_id):
    """Previews first 50 rows of a dataset and computes column profiling."""
    safe_name = secure_filename(dataset_id)
    # Check bundled first, then uploaded
    path = os.path.join(Config.DATA_DIR, safe_name)
    if not os.path.exists(path):
        path = os.path.join(Config.UPLOAD_DIR, safe_name)

    if not os.path.exists(path):
        return jsonify({'success': False, 'error': f'Dataset {dataset_id} not found'}), 404

    try:
        df = pd.read_csv(path)
        total_rows = len(df)
        total_cols = len(df.columns)

        # Column Profiling
        columns_profile = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            missing = int(df[col].isnull().sum())
            unique = int(df[col].nunique())
            sample_val = str(df[col].dropna().iloc[0]) if not df[col].dropna().empty else ''
            columns_profile.append({
                'column': col,
                'data_type': dtype,
                'missing_count': missing,
                'missing_percentage': round(missing / total_rows * 100, 1),
                'unique_count': unique,
                'sample': sample_val
            })

        # Preview first 50 rows
        preview_rows = df.head(50).fillna('').to_dict(orient='records')

        return jsonify({
            'success': True,
            'dataset_id': safe_name,
            'row_count': total_rows,
            'column_count': total_cols,
            'columns': columns_profile,
            'preview_data': preview_rows
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@datasets_bp.route('/upload', methods=['POST'])
def upload_dataset():
    """Allows uploading custom CSV datasets."""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'success': False, 'error': 'Please upload a valid CSV file (.csv)'}), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(Config.UPLOAD_DIR, filename)
    file.save(save_path)

    try:
        df = pd.read_csv(save_path)
        return jsonify({
            'success': True,
            'message': f"Dataset '{filename}' uploaded successfully.",
            'dataset_id': filename,
            'rows': len(df),
            'columns': len(df.columns)
        }), 201
    except Exception as e:
        if os.path.exists(save_path):
            os.remove(save_path)
        return jsonify({'success': False, 'error': f"Failed to parse CSV: {str(e)}"}), 400
