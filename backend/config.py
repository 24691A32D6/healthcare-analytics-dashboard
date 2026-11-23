import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'healthcare-analytics-secret-key-2026')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1')

    # MySQL Configuration
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'healthcare_db')

    # Database Selection: 'mysql' or 'sqlite' (or 'auto' which tries MySQL then falls back to SQLite)
    DB_TYPE = os.environ.get('DB_TYPE', 'auto')
    SQLITE_PATH = os.path.join(BASE_DIR, 'data', 'healthcare.db')

    # Directories
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    UPLOAD_DIR = os.path.join(BASE_DIR, 'data', 'uploads')
    MODELS_DIR = os.path.join(BASE_DIR, 'trained_models')
    
    # Maximum upload size: 16 MB
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
