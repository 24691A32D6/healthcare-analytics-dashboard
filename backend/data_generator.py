import os
import csv
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

random.seed(42)
np.random.seed(42)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

FIRST_NAMES_M = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
                 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth', 'Joshua',
                 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob',
                 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin']

FIRST_NAMES_F = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
                 'Lisa', 'Nancy', 'Betty', 'Sandra', 'Margaret', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
                 'Carol', 'Amanda', 'Dorothy', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
                 'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen']

LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
              'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
              'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
              'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores']

BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
BLOOD_WEIGHTS = [0.30, 0.06, 0.22, 0.05, 0.07, 0.02, 0.25, 0.03]

SMOKING = ['Never', 'Former', 'Current']
SMOKING_WEIGHTS = [0.55, 0.25, 0.20]

ACTIVITY = ['Sedentary', 'Moderate', 'Active']
ACTIVITY_WEIGHTS = [0.35, 0.45, 0.20]

CONDITIONS = [
    'None', 'None', 'None', 'None', 'Hypertension', 'Type 2 Diabetes', 'Asthma',
    'Hyperlipidemia', 'Coronary Artery Disease', 'Mild Arthritis', 'Chronic Bronchitis',
    'Hypertension & Type 2 Diabetes', 'Pre-diabetes'
]

def generate_patients(n=160):
    patients = []
    start_date = datetime.now() - timedelta(days=365)

    for i in range(1, n + 1):
        pid = f"PID-{1000 + i}"
        gender = 'Male' if random.random() < 0.51 else 'Female'
        first_name = random.choice(FIRST_NAMES_M if gender == 'Male' else FIRST_NAMES_F)
        last_name = random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"

        # Age distribution: 18 - 84
        age = int(np.clip(np.random.normal(48, 16), 18, 85))

        # Height in cm
        if gender == 'Male':
            height = round(float(np.random.normal(175, 7.5)), 1)
        else:
            height = round(float(np.random.normal(162, 6.8)), 1)
        height = max(142.0, min(202.0, height))

        # Weight in kg based on height + age effect
        base_bmi = np.random.normal(26.5, 4.8)
        if age > 50:
            base_bmi += 1.5
        base_bmi = max(16.5, min(42.0, base_bmi))
        weight = round(base_bmi * ((height / 100) ** 2), 1)

        # Recompute exact BMI
        bmi = round(weight / ((height / 100) ** 2), 1)
        if bmi < 18.5:
            bmi_cat = 'Underweight'
        elif bmi < 25.0:
            bmi_cat = 'Normal'
        elif bmi < 30.0:
            bmi_cat = 'Overweight'
        else:
            bmi_cat = 'Obese'

        blood_group = random.choices(BLOOD_GROUPS, weights=BLOOD_WEIGHTS)[0]
        smoking = random.choices(SMOKING, weights=SMOKING_WEIGHTS)[0]
        activity = random.choices(ACTIVITY, weights=ACTIVITY_WEIGHTS)[0]

        # Blood pressure correlates with age, BMI, smoking
        systolic_base = 105 + (age * 0.45) + ((bmi - 22) * 0.8)
        if smoking == 'Current':
            systolic_base += 6
        if activity == 'Sedentary':
            systolic_base += 4
        systolic = int(np.clip(np.random.normal(systolic_base, 11), 90, 190))
        diastolic = int(np.clip(systolic * 0.65 + np.random.normal(0, 5), 58, 115))

        # Heart rate (bpm)
        hr_base = 72
        if activity == 'Active':
            hr_base -= 8
        elif activity == 'Sedentary':
            hr_base += 7
        if smoking == 'Current':
            hr_base += 6
        heart_rate = int(np.clip(np.random.normal(hr_base, 9), 52, 118))

        # Body temperature (°C)
        body_temp = round(float(np.random.normal(36.7, 0.35)), 1)
        if random.random() < 0.05:
            body_temp = round(float(np.random.uniform(37.8, 38.8)), 1) # slight fever

        # Glucose level (mg/dL) correlates with age, bmi
        glucose_base = 82 + (age * 0.3) + ((bmi - 22) * 1.4)
        if random.random() < 0.22:
            glucose_base += 45  # diabetic subset
        glucose = round(float(np.clip(np.random.normal(glucose_base, 18), 65, 260)), 1)

        # Cholesterol (mg/dL)
        chol_base = 160 + (age * 0.8) + ((bmi - 22) * 1.5)
        if smoking == 'Current':
            chol_base += 15
        cholesterol = round(float(np.clip(np.random.normal(chol_base, 25), 125, 330)), 1)

        # Medical History
        history = random.choice(CONDITIONS)
        if glucose > 140 and 'Diabetes' not in history:
            history = 'Type 2 Diabetes' if random.random() < 0.7 else history
        if systolic > 140 and 'Hypertension' not in history:
            history = 'Hypertension' if random.random() < 0.7 else history

        # Diabetes Risk Estimation
        d_risk_score = 0
        if glucose >= 140: d_risk_score += 3
        elif glucose >= 110: d_risk_score += 1.5
        if bmi >= 30: d_risk_score += 2
        elif bmi >= 25: d_risk_score += 1
        if age >= 55: d_risk_score += 2
        elif age >= 40: d_risk_score += 1
        if activity == 'Sedentary': d_risk_score += 1
        if 'Diabetes' in history: d_risk_score += 3

        if d_risk_score >= 5:
            diabetes_risk = 'High'
        elif d_risk_score >= 3:
            diabetes_risk = 'Moderate'
        else:
            diabetes_risk = 'Low'

        # Heart Disease Risk Estimation
        h_risk_score = 0
        if systolic >= 140 or diastolic >= 90: h_risk_score += 2.5
        elif systolic >= 130: h_risk_score += 1
        if cholesterol >= 240: h_risk_score += 2.5
        elif cholesterol >= 200: h_risk_score += 1
        if age >= 55: h_risk_score += 2
        if smoking == 'Current': h_risk_score += 2
        elif smoking == 'Former': h_risk_score += 1
        if bmi >= 30: h_risk_score += 1.5
        if 'Coronary' in history or 'Hypertension' in history: h_risk_score += 2

        if h_risk_score >= 6:
            heart_risk = 'High'
        elif h_risk_score >= 3.5:
            heart_risk = 'Moderate'
        else:
            heart_risk = 'Low'

        # Registration date distributed over last 12 months
        reg_offset = random.randint(0, 360)
        reg_date = (start_date + timedelta(days=reg_offset)).strftime('%Y-%m-%d')

        patients.append({
            'patient_id': pid,
            'full_name': full_name,
            'age': age,
            'gender': gender,
            'height': height,
            'weight': weight,
            'bmi': bmi,
            'bmi_category': bmi_cat,
            'blood_group': blood_group,
            'systolic_bp': systolic,
            'diastolic_bp': diastolic,
            'heart_rate': heart_rate,
            'body_temperature': body_temp,
            'glucose_level': glucose,
            'cholesterol': cholesterol,
            'smoking_status': smoking,
            'physical_activity': activity,
            'medical_history': history,
            'diabetes_risk': diabetes_risk,
            'heart_risk': heart_risk,
            'registration_date': reg_date
        })

    df = pd.DataFrame(patients)
    df.to_csv(os.path.join(DATA_DIR, 'patients_seed.csv'), index=False)
    print(f"Generated {len(patients)} patients in patients_seed.csv")
    return df

def generate_diabetes_dataset(n=1000):
    rows = []
    for _ in range(n):
        age = int(np.clip(np.random.normal(45, 14), 21, 82))
        bmi = round(float(np.clip(np.random.normal(29, 6.2), 17.5, 48.0)), 1)
        glucose = int(np.clip(np.random.normal(120, 32), 65, 235))
        bp = int(np.clip(np.random.normal(74, 12), 48, 120)) # diastolic
        skin_thickness = int(np.clip(bmi * 0.8 + np.random.normal(0, 5), 10, 55))
        insulin = int(np.clip(glucose * 0.9 + np.random.normal(20, 40), 15, 450))
        dpf = round(float(np.clip(np.random.exponential(0.45) + 0.1, 0.08, 2.3)), 3)
        activity_score = random.choice([0, 1, 2]) # 0=Sedentary, 1=Moderate, 2=Active
        family_history = 1 if dpf > 0.6 or random.random() < 0.28 else 0

        # Logit calculation for Outcome (balanced ~35% prevalence)
        z = -7.5 + (0.038 * glucose) + (0.08 * bmi) + (0.02 * age) + (0.6 * dpf) + (0.4 * family_history) - (0.35 * activity_score)
        prob = 1 / (1 + np.exp(-z))
        outcome = 1 if random.random() < prob else 0

        rows.append({
            'Age': age,
            'BMI': bmi,
            'Glucose': glucose,
            'BloodPressure': bp,
            'SkinThickness': skin_thickness,
            'Insulin': insulin,
            'DiabetesPedigreeFunction': dpf,
            'PhysicalActivity': activity_score,
            'FamilyHistory': family_history,
            'Outcome': outcome
        })

    df = pd.DataFrame(rows)
    df.to_csv(os.path.join(DATA_DIR, 'diabetes_data.csv'), index=False)
    print(f"Generated {len(rows)} samples in diabetes_data.csv (Outcome rate: {df['Outcome'].mean():.2%})")
    return df

def generate_heart_disease_dataset(n=1000):
    rows = []
    for _ in range(n):
        age = int(np.clip(np.random.normal(54, 11), 29, 78))
        gender = 1 if random.random() < 0.65 else 0  # 1=Male, 0=Female
        cp = random.choices([0, 1, 2, 3], weights=[0.48, 0.17, 0.28, 0.07])[0] # Chest pain type
        trestbps = int(np.clip(np.random.normal(132, 17), 94, 200)) # Resting BP
        chol = int(np.clip(np.random.normal(246, 50), 126, 420)) # Cholesterol
        fbs = 1 if random.random() < 0.15 else 0 # Fasting Blood Sugar > 120
        restecg = random.choices([0, 1, 2], weights=[0.49, 0.48, 0.03])[0]
        thalach = int(np.clip(205 - (age * 0.8) + np.random.normal(0, 15), 75, 202)) # Max Heart Rate
        exang = 1 if random.random() < 0.32 else 0 # Exercise induced angina
        oldpeak = round(float(np.clip(np.random.exponential(0.9), 0.0, 5.8)), 1)
        slope = random.choices([0, 1, 2], weights=[0.12, 0.46, 0.42])[0]
        bmi = round(float(np.clip(np.random.normal(27.8, 4.6), 18.0, 44.0)), 1)
        smoking = random.choices([0, 1, 2], weights=[0.45, 0.30, 0.25])[0] # 0=Never, 1=Former, 2=Current
        activity = random.choices([0, 1, 2], weights=[0.35, 0.45, 0.20])[0] # 0=Sedentary, 1=Moderate, 2=Active

        # Logit calculation for Heart Disease Outcome (balanced ~45% prevalence)
        z = -5.8 + (0.04 * age) + (0.75 * gender) + (0.6 * cp) + (0.015 * trestbps) + (0.005 * chol) - (0.022 * thalach) + (0.9 * exang) + (0.6 * oldpeak) + (0.4 * smoking) - (0.35 * activity) + (0.04 * bmi)
        prob = 1 / (1 + np.exp(-z))
        outcome = 1 if random.random() < prob else 0

        rows.append({
            'Age': age,
            'Gender': gender,
            'ChestPainType': cp,
            'RestingBP': trestbps,
            'Cholesterol': chol,
            'FastingBS': fbs,
            'RestingECG': restecg,
            'MaxHR': thalach,
            'ExerciseAngina': exang,
            'Oldpeak': oldpeak,
            'ST_Slope': slope,
            'BMI': bmi,
            'SmokingStatus': smoking,
            'PhysicalActivity': activity,
            'Outcome': outcome
        })

    df = pd.DataFrame(rows)
    df.to_csv(os.path.join(DATA_DIR, 'heart_disease_data.csv'), index=False)
    print(f"Generated {len(rows)} samples in heart_disease_data.csv (Outcome rate: {df['Outcome'].mean():.2%})")
    return df

def seed_database():
    import sys
    sys.path.append(os.path.dirname(__file__))
    from database import Database

    Database.init_db()
    # Check if patients already exist
    existing = Database.query("SELECT COUNT(*) as cnt FROM patients;", one=True)
    if existing and existing['cnt'] > 0:
        print(f"Database already has {existing['cnt']} patients.")
        return

    patients_csv = os.path.join(DATA_DIR, 'patients_seed.csv')
    if not os.path.exists(patients_csv):
        generate_patients()

    df = pd.read_csv(patients_csv)
    records = []
    for _, r in df.iterrows():
        records.append((
            r['patient_id'], r['full_name'], int(r['age']), r['gender'],
            float(r['height']), float(r['weight']), float(r['bmi']), r['bmi_category'],
            r['blood_group'], int(r['systolic_bp']), int(r['diastolic_bp']),
            int(r['heart_rate']), float(r['body_temperature']), float(r['glucose_level']),
            float(r['cholesterol']), r['smoking_status'], r['physical_activity'],
            str(r['medical_history']), r['diabetes_risk'], r['heart_risk'],
            str(r['registration_date'])
        ))

    insert_sql = """
    INSERT INTO patients (
        patient_id, full_name, age, gender, height, weight, bmi, bmi_category,
        blood_group, systolic_bp, diastolic_bp, heart_rate, body_temperature,
        glucose_level, cholesterol, smoking_status, physical_activity,
        medical_history, diabetes_risk, heart_risk, registration_date
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    Database.execute_many(insert_sql, records)
    print(f"Successfully seeded {len(records)} patients into database.")

    # Also add sample medical records for top 40 patients
    doc_names = ['Dr. Sarah Jenkins, MD', 'Dr. Rajesh Rao, MD', 'Dr. David Kim, MD', 'Dr. Maria Rossi, MD']
    record_types = ['Routine Health Checkup', 'Annual Physical Exam', 'Cardiology Consultation', 'Endocrine Evaluation']
    diagnoses = [
        'Normal clinical baseline. Advised regular exercise and hydration.',
        'Stage 1 Hypertension. Low sodium diet and lifestyle modification initiated.',
        'Impaired fasting glucose (Pre-diabetes). Glycemic tracking prescribed.',
        'Elevated LDL Cholesterol. Dietary statin consideration in 3 months.',
        'Mild seasonal allergic rhinitis. Antihistamine as needed.',
        'Excellent overall vitals. Routine follow-up scheduled in 12 months.'
    ]

    med_records = []
    for p in records[:45]:
        pid = p[0]
        reg_d = p[20]
        rec_type = random.choice(record_types)
        diag = random.choice(diagnoses)
        doc = random.choice(doc_names)
        plan = 'Continue current regimen. Schedule blood work in 6 months.'
        notes = f'Vitals stable. BP: {p[9]}/{p[10]} mmHg. Glucose: {p[13]} mg/dL.'
        med_records.append((pid, rec_type, diag, doc, plan, notes, reg_d))

    med_sql = """
    INSERT INTO medical_records (patient_id, record_type, diagnosis, doctor_name, treatment_plan, notes, record_date)
    VALUES (%s, %s, %s, %s, %s, %s, %s);
    """
    Database.execute_many(med_sql, med_records)
    print(f"Successfully seeded {len(med_records)} medical records into database.")

if __name__ == '__main__':
    generate_patients()
    generate_diabetes_dataset()
    generate_heart_disease_dataset()
    seed_database()
