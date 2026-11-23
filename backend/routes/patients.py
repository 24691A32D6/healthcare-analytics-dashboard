from flask import Blueprint, request, jsonify
from datetime import datetime
from database import Database

patients_bp = Blueprint('patients', __name__)

def calculate_bmi_and_category(height_cm, weight_kg):
    try:
        h_m = float(height_cm) / 100.0
        w_kg = float(weight_kg)
        if h_m <= 0 or w_kg <= 0:
            return 0.0, 'Normal'
        bmi = round(w_kg / (h_m ** 2), 1)
        if bmi < 18.5:
            cat = 'Underweight'
        elif bmi < 25.0:
            cat = 'Normal'
        elif bmi < 30.0:
            cat = 'Overweight'
        else:
            cat = 'Obese'
        return bmi, cat
    except Exception:
        return 22.0, 'Normal'

@patients_bp.route('', methods=['GET'])
def get_patients():
    """Fetches patients with search, filtering, and sorting."""
    search = request.args.get('q', '').strip()
    gender = request.args.get('gender', '').strip()
    d_risk = request.args.get('diabetes_risk', '').strip()
    h_risk = request.args.get('heart_risk', '').strip()
    bmi_cat = request.args.get('bmi_category', '').strip()
    sort_by = request.args.get('sort_by', 'id')
    sort_order = request.args.get('order', 'ASC').upper()

    # Whitelist sorting fields
    valid_sorts = ['id', 'patient_id', 'full_name', 'age', 'bmi', 'glucose_level', 'systolic_bp', 'registration_date']
    if sort_by not in valid_sorts:
        sort_by = 'id'
    if sort_order not in ('ASC', 'DESC'):
        sort_order = 'ASC'

    query = "SELECT * FROM patients WHERE 1=1"
    params = []

    if search:
        query += " AND (patient_id LIKE %s OR full_name LIKE %s OR medical_history LIKE %s)"
        pattern = f"%{search}%"
        params.extend([pattern, pattern, pattern])

    if gender:
        query += " AND gender = %s"
        params.append(gender)

    if d_risk:
        query += " AND diabetes_risk = %s"
        params.append(d_risk)

    if h_risk:
        query += " AND heart_risk = %s"
        params.append(h_risk)

    if bmi_cat:
        query += " AND bmi_category = %s"
        params.append(bmi_cat)

    query += f" ORDER BY {sort_by} {sort_order};"
    rows = Database.query(query, params)
    return jsonify({'success': True, 'count': len(rows), 'patients': rows})

@patients_bp.route('/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Fetches full profile for a single patient and their clinical records."""
    patient = Database.query("SELECT * FROM patients WHERE patient_id = %s;", [patient_id], one=True)
    if not patient:
        return jsonify({'success': False, 'error': 'Patient not found'}), 404

    records = Database.query("SELECT * FROM medical_records WHERE patient_id = %s ORDER BY record_date DESC;", [patient_id])
    preds = Database.query("SELECT * FROM prediction_history WHERE patient_id = %s ORDER BY created_at DESC LIMIT 5;", [patient_id])

    return jsonify({
        'success': True,
        'patient': patient,
        'medical_records': records,
        'prediction_history': preds
    })

@patients_bp.route('', methods=['POST'])
def add_patient():
    """Creates a new patient record."""
    data = request.get_json() or {}

    required = ['full_name', 'age', 'gender', 'height', 'weight']
    for f in required:
        if f not in data or data[f] == '':
            return jsonify({'success': False, 'error': f"Field '{f}' is required."}), 400

    # Auto-generate patient_id if not supplied
    patient_id = data.get('patient_id')
    if not patient_id:
        last = Database.query("SELECT id FROM patients ORDER BY id DESC LIMIT 1;", one=True)
        next_id = (last['id'] + 1001) if last else 1001
        patient_id = f"PID-{next_id}"

    # Calculate BMI
    bmi, bmi_cat = calculate_bmi_and_category(data['height'], data['weight'])

    # Determine risk tiers based on initial vitals
    glucose = float(data.get('glucose_level', 95.0))
    systolic = int(data.get('systolic_bp', 120))
    d_risk = 'High' if glucose >= 140 else ('Moderate' if glucose >= 110 or bmi >= 28 else 'Low')
    h_risk = 'High' if systolic >= 140 else ('Moderate' if systolic >= 130 or data.get('smoking_status') == 'Current' else 'Low')

    reg_date = data.get('registration_date') or datetime.now().strftime('%Y-%m-%d')

    sql = """
    INSERT INTO patients (
        patient_id, full_name, age, gender, height, weight, bmi, bmi_category,
        blood_group, systolic_bp, diastolic_bp, heart_rate, body_temperature,
        glucose_level, cholesterol, smoking_status, physical_activity,
        medical_history, diabetes_risk, heart_risk, registration_date
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    params = (
        patient_id, data['full_name'], int(data['age']), data['gender'],
        float(data['height']), float(data['weight']), bmi, bmi_cat,
        data.get('blood_group', 'O+'), int(data.get('systolic_bp', 120)),
        int(data.get('diastolic_bp', 80)), int(data.get('heart_rate', 72)),
        float(data.get('body_temperature', 36.6)), glucose,
        float(data.get('cholesterol', 185.0)), data.get('smoking_status', 'Never'),
        data.get('physical_activity', 'Moderate'), data.get('medical_history', 'None'),
        d_risk, h_risk, reg_date
    )

    try:
        new_id = Database.execute(sql, params)
        return jsonify({
            'success': True,
            'message': 'Patient added successfully',
            'patient_id': patient_id,
            'id': new_id
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@patients_bp.route('/<patient_id>', methods=['PUT'])
def update_patient(patient_id):
    """Updates an existing patient record."""
    data = request.get_json() or {}
    existing = Database.query("SELECT * FROM patients WHERE patient_id = %s;", [patient_id], one=True)
    if not existing:
        return jsonify({'success': False, 'error': 'Patient not found'}), 404

    height = float(data.get('height', existing['height']))
    weight = float(data.get('weight', existing['weight']))
    bmi, bmi_cat = calculate_bmi_and_category(height, weight)

    glucose = float(data.get('glucose_level', existing['glucose_level']))
    systolic = int(data.get('systolic_bp', existing['systolic_bp']))
    d_risk = 'High' if glucose >= 140 else ('Moderate' if glucose >= 110 or bmi >= 28 else 'Low')
    h_risk = 'High' if systolic >= 140 else ('Moderate' if systolic >= 130 or data.get('smoking_status') == 'Current' else 'Low')

    sql = """
    UPDATE patients SET
        full_name = %s, age = %s, gender = %s, height = %s, weight = %s,
        bmi = %s, bmi_category = %s, blood_group = %s, systolic_bp = %s,
        diastolic_bp = %s, heart_rate = %s, body_temperature = %s,
        glucose_level = %s, cholesterol = %s, smoking_status = %s,
        physical_activity = %s, medical_history = %s, diabetes_risk = %s,
        heart_risk = %s
    WHERE patient_id = %s;
    """
    params = (
        data.get('full_name', existing['full_name']),
        int(data.get('age', existing['age'])),
        data.get('gender', existing['gender']),
        height, weight, bmi, bmi_cat,
        data.get('blood_group', existing['blood_group']),
        int(data.get('systolic_bp', existing['systolic_bp'])),
        int(data.get('diastolic_bp', existing['diastolic_bp'])),
        int(data.get('heart_rate', existing['heart_rate'])),
        float(data.get('body_temperature', existing['body_temperature'])),
        glucose,
        float(data.get('cholesterol', existing['cholesterol'])),
        data.get('smoking_status', existing['smoking_status']),
        data.get('physical_activity', existing['physical_activity']),
        data.get('medical_history', existing['medical_history']),
        d_risk, h_risk, patient_id
    )

    try:
        Database.execute(sql, params)
        return jsonify({'success': True, 'message': 'Patient updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@patients_bp.route('/<patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    """Deletes a patient and cascades removal of records."""
    existing = Database.query("SELECT * FROM patients WHERE patient_id = %s;", [patient_id], one=True)
    if not existing:
        return jsonify({'success': False, 'error': 'Patient not found'}), 404

    try:
        Database.execute("DELETE FROM medical_records WHERE patient_id = %s;", [patient_id])
        Database.execute("DELETE FROM prediction_history WHERE patient_id = %s;", [patient_id])
        Database.execute("DELETE FROM patients WHERE patient_id = %s;", [patient_id])
        return jsonify({'success': True, 'message': f'Patient {patient_id} deleted successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@patients_bp.route('/<patient_id>/records', methods=['POST'])
def add_medical_record(patient_id):
    """Adds a clinical checkup or doctor record to a patient."""
    data = request.get_json() or {}
    required = ['record_type', 'diagnosis', 'doctor_name']
    for f in required:
        if not data.get(f):
            return jsonify({'success': False, 'error': f"'{f}' is required."}), 400

    rec_date = data.get('record_date') or datetime.now().strftime('%Y-%m-%d')
    sql = """
    INSERT INTO medical_records (patient_id, record_type, diagnosis, doctor_name, treatment_plan, notes, record_date)
    VALUES (%s, %s, %s, %s, %s, %s, %s);
    """
    params = (
        patient_id, data['record_type'], data['diagnosis'],
        data['doctor_name'], data.get('treatment_plan', ''),
        data.get('notes', ''), rec_date
    )
    try:
        Database.execute(sql, params)
        return jsonify({'success': True, 'message': 'Medical record saved successfully.'}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
