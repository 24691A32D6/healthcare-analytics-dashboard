import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve
)
from config import Config

class MLPipeline:
    MODELS_DIR = Config.MODELS_DIR

    DIABETES_FEATURES = [
        'Age', 'BMI', 'Glucose', 'BloodPressure', 'Insulin',
        'PhysicalActivity', 'FamilyHistory'
    ]

    HEART_FEATURES = [
        'Age', 'Gender', 'RestingBP', 'Cholesterol', 'MaxHR',
        'BMI', 'SmokingStatus', 'PhysicalActivity', 'ExerciseAngina'
    ]

    @classmethod
    def train_all_models(cls):
        """Trains both Diabetes and Heart Disease models and saves artifacts."""
        print("[MLPipeline] Starting model training for Diabetes & Heart Disease...")
        diabetes_metrics = cls.train_diabetes_models()
        heart_metrics = cls.train_heart_models()
        print("[MLPipeline] All models trained and serialized successfully.")
        return {'diabetes': diabetes_metrics, 'heart': heart_metrics}

    @classmethod
    def train_diabetes_models(cls):
        data_path = os.path.join(Config.DATA_DIR, 'diabetes_data.csv')
        df = pd.read_csv(data_path)

        # Feature selection & validation
        X = df[cls.DIABETES_FEATURES].copy()
        y = df['Outcome'].copy()

        # 80/20 train/test split with stratification
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Save scaler
        joblib.dump(scaler, os.path.join(cls.MODELS_DIR, 'diabetes_scaler.joblib'))

        models = {
            'random_forest': RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
            'logistic_regression': LogisticRegression(max_iter=1000, random_state=42),
            'decision_tree': DecisionTreeClassifier(max_depth=5, random_state=42)
        }

        metrics_summary = {}

        for name, model in models.items():
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
            y_prob = model.predict_proba(X_test_scaled)[:, 1]

            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, zero_division=0))
            rec = float(recall_score(y_test, y_pred, zero_division=0))
            f1 = float(f1_score(y_test, y_pred, zero_division=0))
            auc = float(roc_auc_score(y_test, y_prob))
            cm = confusion_matrix(y_test, y_pred).tolist()

            # ROC curve points (sample 20 points for visualization)
            fpr, tpr, _ = roc_curve(y_test, y_prob)
            roc_points = [
                {'fpr': round(float(f), 4), 'tpr': round(float(t), 4)}
                for f, t in zip(fpr[::max(1, len(fpr)//20)], tpr[::max(1, len(tpr)//20)])
            ]

            # Feature Importance
            if hasattr(model, 'feature_importances_'):
                importances = dict(zip(cls.DIABETES_FEATURES, [round(float(x), 4) for x in model.feature_importances_]))
            elif hasattr(model, 'coef_'):
                importances = dict(zip(cls.DIABETES_FEATURES, [round(float(abs(x)), 4) for x in model.coef_[0]]))
            else:
                importances = {}

            metrics_summary[name] = {
                'name': name.replace('_', ' ').title(),
                'accuracy': round(acc * 100, 2),
                'precision': round(prec * 100, 2),
                'recall': round(rec * 100, 2),
                'f1_score': round(f1 * 100, 2),
                'roc_auc': round(auc, 4),
                'confusion_matrix': cm,
                'feature_importance': importances,
                'roc_points': roc_points
            }

            joblib.dump(model, os.path.join(cls.MODELS_DIR, f'diabetes_{name}.joblib'))

        # Save metrics JSON
        with open(os.path.join(cls.MODELS_DIR, 'diabetes_metrics.json'), 'w') as f:
            json.dump(metrics_summary, f, indent=2)

        return metrics_summary

    @classmethod
    def train_heart_models(cls):
        data_path = os.path.join(Config.DATA_DIR, 'heart_disease_data.csv')
        df = pd.read_csv(data_path)

        # Handle features
        if 'RestingBP' not in df.columns and 'systolic_bp' in df.columns:
            df['RestingBP'] = df['systolic_bp']
        if 'MaxHR' not in df.columns and 'heart_rate' in df.columns:
            df['MaxHR'] = df['heart_rate']
        if 'ExerciseAngina' not in df.columns:
            df['ExerciseAngina'] = 0

        X = df[cls.HEART_FEATURES].copy()
        y = df['Outcome'].copy()

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        joblib.dump(scaler, os.path.join(cls.MODELS_DIR, 'heart_scaler.joblib'))

        models = {
            'random_forest': RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
            'logistic_regression': LogisticRegression(max_iter=1000, random_state=42),
            'decision_tree': DecisionTreeClassifier(max_depth=5, random_state=42)
        }

        metrics_summary = {}

        for name, model in models.items():
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
            y_prob = model.predict_proba(X_test_scaled)[:, 1]

            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, zero_division=0))
            rec = float(recall_score(y_test, y_pred, zero_division=0))
            f1 = float(f1_score(y_test, y_pred, zero_division=0))
            auc = float(roc_auc_score(y_test, y_prob))
            cm = confusion_matrix(y_test, y_pred).tolist()

            fpr, tpr, _ = roc_curve(y_test, y_prob)
            roc_points = [
                {'fpr': round(float(f), 4), 'tpr': round(float(t), 4)}
                for f, t in zip(fpr[::max(1, len(fpr)//20)], tpr[::max(1, len(tpr)//20)])
            ]

            if hasattr(model, 'feature_importances_'):
                importances = dict(zip(cls.HEART_FEATURES, [round(float(x), 4) for x in model.feature_importances_]))
            elif hasattr(model, 'coef_'):
                importances = dict(zip(cls.HEART_FEATURES, [round(float(abs(x)), 4) for x in model.coef_[0]]))
            else:
                importances = {}

            metrics_summary[name] = {
                'name': name.replace('_', ' ').title(),
                'accuracy': round(acc * 100, 2),
                'precision': round(prec * 100, 2),
                'recall': round(rec * 100, 2),
                'f1_score': round(f1 * 100, 2),
                'roc_auc': round(auc, 4),
                'confusion_matrix': cm,
                'feature_importance': importances,
                'roc_points': roc_points
            }

            joblib.dump(model, os.path.join(cls.MODELS_DIR, f'heart_{name}.joblib'))

        with open(os.path.join(cls.MODELS_DIR, 'heart_metrics.json'), 'w') as f:
            json.dump(metrics_summary, f, indent=2)

        return metrics_summary

    @classmethod
    def get_metrics(cls, disease_type='diabetes'):
        file_path = os.path.join(cls.MODELS_DIR, f'{disease_type}_metrics.json')
        if not os.path.exists(file_path):
            cls.train_all_models()
        with open(file_path, 'r') as f:
            return json.load(f)

    @classmethod
    def predict_diabetes(cls, data, model_type='random_forest'):
        """Predicts diabetes risk for user inputs with validation and contributing factors."""
        model_file = os.path.join(cls.MODELS_DIR, f'diabetes_{model_type}.joblib')
        scaler_file = os.path.join(cls.MODELS_DIR, 'diabetes_scaler.joblib')

        if not os.path.exists(model_file) or not os.path.exists(scaler_file):
            cls.train_diabetes_models()

        model = joblib.load(model_file)
        scaler = joblib.load(scaler_file)

        # Parse and sanitize inputs
        age = float(data.get('age', 45))
        bmi = float(data.get('bmi', 25.0))
        glucose = float(data.get('glucose', 100.0))
        bp = float(data.get('blood_pressure', 75.0))
        insulin = float(data.get('insulin', 80.0))
        activity = int(data.get('physical_activity', 1)) # 0=Sedentary, 1=Moderate, 2=Active
        family_history = int(data.get('family_history', 0))

        features_df = pd.DataFrame([{
            'Age': age,
            'BMI': bmi,
            'Glucose': glucose,
            'BloodPressure': bp,
            'Insulin': insulin,
            'PhysicalActivity': activity,
            'FamilyHistory': family_history
        }])

        scaled_features = scaler.transform(features_df[cls.DIABETES_FEATURES])
        prob = float(model.predict_proba(scaled_features)[0][1])
        prediction = int(model.predict(scaled_features)[0])

        # Clinical Risk Categorization
        risk_pct = round(prob * 100, 1)
        if risk_pct < 35.0:
            category = 'Low Risk'
            badge_color = 'success'
        elif risk_pct < 65.0:
            category = 'Moderate Risk'
            badge_color = 'warning'
        else:
            category = 'High Risk'
            badge_color = 'danger'

        # Analyze Key Contributing Factors
        factors = []
        if glucose >= 140:
            factors.append({'factor': 'Fasting Glucose', 'impact': 'High', 'value': f"{glucose} mg/dL", 'note': 'Significantly elevated glucose level is a primary marker.'})
        elif glucose >= 105:
            factors.append({'factor': 'Fasting Glucose', 'impact': 'Moderate', 'value': f"{glucose} mg/dL", 'note': 'Impaired fasting glucose indicates pre-diabetic tendency.'})
        
        if bmi >= 30:
            factors.append({'factor': 'BMI (Body Mass Index)', 'impact': 'High', 'value': f"{bmi}", 'note': 'Obesity is strongly correlated with insulin resistance.'})
        elif bmi >= 25:
            factors.append({'factor': 'BMI', 'impact': 'Moderate', 'value': f"{bmi}", 'note': 'Overweight range contributes to metabolic risk.'})

        if age >= 50:
            factors.append({'factor': 'Patient Age', 'impact': 'Moderate', 'value': f"{int(age)} years", 'note': 'Risk increases with advancing age.'})

        if family_history == 1:
            factors.append({'factor': 'Family History', 'impact': 'Moderate', 'value': 'Present', 'note': 'Genetic predisposition increases likelihood.'})

        if activity == 0:
            factors.append({'factor': 'Physical Activity', 'impact': 'Moderate', 'value': 'Sedentary', 'note': 'Sedentary lifestyle reduces glycemic efficiency.'})

        if not factors:
            factors.append({'factor': 'Healthy Vitals', 'impact': 'Positive', 'value': 'Normal Ranges', 'note': 'Key markers are within clinically healthy limits.'})

        return {
            'risk_score': risk_pct,
            'risk_category': category,
            'badge_color': badge_color,
            'prediction': prediction,
            'model_used': model_type.replace('_', ' ').title(),
            'contributing_factors': factors,
            'disclaimer': 'This evaluation is an algorithmic estimation intended strictly for educational and demonstration purposes. It does not constitute a medical diagnosis or treatment plan.'
        }

    @classmethod
    def predict_heart(cls, data, model_type='random_forest'):
        """Predicts heart disease risk for user inputs."""
        model_file = os.path.join(cls.MODELS_DIR, f'heart_{model_type}.joblib')
        scaler_file = os.path.join(cls.MODELS_DIR, 'heart_scaler.joblib')

        if not os.path.exists(model_file) or not os.path.exists(scaler_file):
            cls.train_heart_models()

        model = joblib.load(model_file)
        scaler = joblib.load(scaler_file)

        age = float(data.get('age', 50))
        gender = 1 if str(data.get('gender', 'Male')).lower() in ('male', '1', 'm') else 0
        systolic_bp = float(data.get('systolic_bp', data.get('blood_pressure', 125.0)))
        cholesterol = float(data.get('cholesterol', 190.0))
        heart_rate = float(data.get('heart_rate', 75.0))
        bmi = float(data.get('bmi', 26.0))
        smoking = int(data.get('smoking_status', 0)) # 0=Never, 1=Former, 2=Current
        activity = int(data.get('physical_activity', 1))
        angina = int(data.get('exercise_angina', 0))

        features_df = pd.DataFrame([{
            'Age': age,
            'Gender': gender,
            'RestingBP': systolic_bp,
            'Cholesterol': cholesterol,
            'MaxHR': heart_rate,
            'BMI': bmi,
            'SmokingStatus': smoking,
            'PhysicalActivity': activity,
            'ExerciseAngina': angina
        }])

        scaled = scaler.transform(features_df[cls.HEART_FEATURES])
        prob = float(model.predict_proba(scaled)[0][1])
        prediction = int(model.predict(scaled)[0])

        risk_pct = round(prob * 100, 1)
        if risk_pct < 35.0:
            category = 'Low Risk'
            badge_color = 'success'
        elif risk_pct < 65.0:
            category = 'Moderate Risk'
            badge_color = 'warning'
        else:
            category = 'High Risk'
            badge_color = 'danger'

        factors = []
        if systolic_bp >= 140:
            factors.append({'factor': 'Systolic Blood Pressure', 'impact': 'High', 'value': f"{int(systolic_bp)} mmHg", 'note': 'Stage 2 hypertension places extra strain on the myocardium.'})
        elif systolic_bp >= 130:
            factors.append({'factor': 'Systolic Blood Pressure', 'impact': 'Moderate', 'value': f"{int(systolic_bp)} mmHg", 'note': 'Pre-hypertensive range increases cardiovascular risk.'})

        if cholesterol >= 240:
            factors.append({'factor': 'Total Cholesterol', 'impact': 'High', 'value': f"{int(cholesterol)} mg/dL", 'note': 'Hypercholesterolemia accelerates arterial plaque buildup.'})
        elif cholesterol >= 200:
            factors.append({'factor': 'Total Cholesterol', 'impact': 'Moderate', 'value': f"{int(cholesterol)} mg/dL", 'note': 'Borderline high cholesterol level.'})

        if smoking == 2:
            factors.append({'factor': 'Smoking Status', 'impact': 'High', 'value': 'Current Smoker', 'note': 'Active nicotine/tobacco consumption damages endothelial lining.'})

        if age >= 55:
            factors.append({'factor': 'Age', 'impact': 'Moderate', 'value': f"{int(age)} years", 'note': 'Cardiovascular arterial elasticity declines with age.'})

        if angina == 1:
            factors.append({'factor': 'Exercise Induced Angina', 'impact': 'High', 'value': 'Present', 'note': 'Chest discomfort during exertion indicates cardiac ischemia.'})

        if not factors:
            factors.append({'factor': 'Cardiovascular Markers', 'impact': 'Positive', 'value': 'Normal Ranges', 'note': 'Blood pressure, cholesterol and heart rate appear healthy.'})

        return {
            'risk_score': risk_pct,
            'risk_category': category,
            'badge_color': badge_color,
            'prediction': prediction,
            'model_used': model_type.replace('_', ' ').title(),
            'contributing_factors': factors,
            'disclaimer': 'This evaluation is an algorithmic estimation intended strictly for educational and demonstration purposes. It does not constitute a medical diagnosis or treatment plan.'
        }
