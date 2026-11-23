import os
import sys
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from database import Database
from routes.patients import patients_bp
from routes.analytics import analytics_bp
from routes.prediction import prediction_bp
from routes.datasets import datasets_bp

# Set up paths
BACKEND_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BACKEND_DIR, '..', 'frontend'))

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
app.config.from_object(Config)
CORS(app)

# Register API blueprints
app.register_blueprint(patients_bp, url_prefix='/api/patients')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(prediction_bp, url_prefix='/api/predict')
app.register_blueprint(datasets_bp, url_prefix='/api/datasets')

# Health Check & System Status Endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    db_engine = Database.get_active_engine()
    patient_count = 0
    try:
        cnt = Database.query("SELECT COUNT(*) as c FROM patients;", one=True)
        if cnt:
            patient_count = cnt['c']
    except Exception:
        pass

    return jsonify({
        'status': 'healthy',
        'service': 'Healthcare Analytics & Disease Prediction API',
        'database_engine': db_engine,
        'mysql_target': f"{Config.MYSQL_HOST}:{Config.MYSQL_PORT}/{Config.MYSQL_DB}",
        'patients_in_db': patient_count,
        'ml_models': {
            'diabetes_models': ['random_forest', 'logistic_regression', 'decision_tree'],
            'heart_models': ['random_forest', 'logistic_regression', 'decision_tree']
        }
    })

# Serve Frontend SPA
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')

def initialize_app():
    """Initializes database schema and ensures ML models are ready."""
    print("=" * 65)
    print("  HEALTHCARE DATA ANALYTICS & DISEASE PREDICTION SYSTEM")
    print("  College Engineering Project Demonstration Environment")
    print("=" * 65)
    Database.init_db()

    # Check if patients need to be seeded
    existing = Database.query("SELECT COUNT(*) as c FROM patients;", one=True)
    if not existing or existing['c'] == 0:
        print("[App] Empty database detected. Running seed script...")
        import data_generator
        data_generator.generate_patients()
        data_generator.generate_diabetes_dataset()
        data_generator.generate_heart_disease_dataset()
        data_generator.seed_database()

    # Ensure models are trained
    from models.ml_pipeline import MLPipeline
    rf_model_file = os.path.join(Config.MODELS_DIR, 'diabetes_random_forest.joblib')
    if not os.path.exists(rf_model_file):
        print("[App] Initializing and training ML models...")
        MLPipeline.train_all_models()

    print("[App] System is ready.")

if __name__ == '__main__':
    initialize_app()
    port = int(os.environ.get('PORT', 5000))
    print(f"[App] Serving API & Frontend on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
