import json
from flask import Blueprint, request, jsonify
from models.ml_pipeline import MLPipeline
from database import Database

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/metrics/<disease_type>', methods=['GET'])
def get_model_metrics(disease_type):
    """Returns test evaluation metrics for all 3 models of the specified disease."""
    if disease_type not in ('diabetes', 'heart'):
        return jsonify({'success': False, 'error': 'Invalid disease type. Must be diabetes or heart.'}), 400

    try:
        metrics = MLPipeline.get_metrics(disease_type)
        return jsonify({'success': True, 'disease': disease_type, 'metrics': metrics})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@prediction_bp.route('/diabetes', methods=['POST'])
def predict_diabetes():
    """Predicts diabetes risk from user-submitted clinical features."""
    data = request.get_json() or {}
    model_type = data.get('model', 'random_forest')
    patient_id = data.get('patient_id')

    try:
        result = MLPipeline.predict_diabetes(data, model_type=model_type)

        # Record into prediction history
        features_json = json.dumps({
            'age': data.get('age'), 'bmi': data.get('bmi'),
            'glucose': data.get('glucose'), 'bp': data.get('blood_pressure')
        })
        factors_json = json.dumps(result['contributing_factors'])

        sql = """
        INSERT INTO prediction_history (patient_id, prediction_type, model_used, input_features, risk_score, risk_category, feature_importance)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """
        Database.execute(sql, (
            patient_id, 'Diabetes Risk', result['model_used'],
            features_json, result['risk_score'], result['risk_category'], factors_json
        ))

        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@prediction_bp.route('/heart', methods=['POST'])
def predict_heart():
    """Predicts cardiovascular disease risk from user-submitted clinical features."""
    data = request.get_json() or {}
    model_type = data.get('model', 'random_forest')
    patient_id = data.get('patient_id')

    try:
        result = MLPipeline.predict_heart(data, model_type=model_type)

        features_json = json.dumps({
            'age': data.get('age'), 'systolic_bp': data.get('systolic_bp'),
            'cholesterol': data.get('cholesterol'), 'heart_rate': data.get('heart_rate')
        })
        factors_json = json.dumps(result['contributing_factors'])

        sql = """
        INSERT INTO prediction_history (patient_id, prediction_type, model_used, input_features, risk_score, risk_category, feature_importance)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """
        Database.execute(sql, (
            patient_id, 'Heart Disease Risk', result['model_used'],
            features_json, result['risk_score'], result['risk_category'], factors_json
        ))

        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@prediction_bp.route('/history', methods=['GET'])
def get_history():
    """Returns the most recent prediction history logs."""
    try:
        logs = Database.query("SELECT * FROM prediction_history ORDER BY created_at DESC LIMIT 20;")
        return jsonify({'success': True, 'history': logs})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
