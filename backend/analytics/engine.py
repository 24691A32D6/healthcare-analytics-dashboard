import numpy as np
import pandas as pd
from database import Database
from models.preprocessor import DataPreprocessor

class AnalyticsEngine:

    @classmethod
    def get_patients_df(cls):
        """Fetches all patient records from the database into a Pandas DataFrame."""
        rows = Database.query("SELECT * FROM patients;")
        if not rows:
            return pd.DataFrame()
        df = pd.DataFrame(rows)
        # Convert numeric columns
        numeric_cols = [
            'age', 'height', 'weight', 'bmi', 'systolic_bp', 'diastolic_bp',
            'heart_rate', 'body_temperature', 'glucose_level', 'cholesterol'
        ]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        return df

    @classmethod
    def get_dashboard_summary(cls):
        """Calculates key metrics for the main dashboard cards and charts."""
        df = cls.get_patients_df()
        if df.empty:
            return {
                'total_patients': 0, 'male_patients': 0, 'female_patients': 0,
                'avg_age': 0, 'diabetes_risk_patients': 0, 'heart_risk_patients': 0,
                'healthy_patients': 0, 'total_medical_records': 0
            }

        total_patients = len(df)
        male_patients = int((df['gender'] == 'Male').sum())
        female_patients = int((df['gender'] == 'Female').sum())
        avg_age = round(float(df['age'].mean()), 1)

        diabetes_risk_patients = int((df['diabetes_risk'].isin(['Moderate', 'High'])).sum())
        heart_risk_patients = int((df['heart_risk'].isin(['Moderate', 'High'])).sum())
        healthy_patients = int((
            (df['diabetes_risk'] == 'Low') &
            (df['heart_risk'] == 'Low') &
            (df['bmi_category'] == 'Normal')
        ).sum())

        # Total medical records count from database
        med_cnt = Database.query("SELECT COUNT(*) as cnt FROM medical_records;", one=True)
        total_records = med_cnt['cnt'] if med_cnt else 0

        # 1. Age Group Breakdown
        age_bins = [0, 19, 39, 59, 120]
        age_labels = ['<20', '20-39', '40-59', '60+']
        df['age_group'] = pd.cut(df['age'], bins=age_bins, labels=age_labels, right=True)
        age_group_dist = df['age_group'].value_counts().reindex(age_labels).fillna(0).to_dict()

        # 2. Gender distribution
        gender_dist = df['gender'].value_counts().to_dict()

        # 3. Disease distribution (from medical_history)
        disease_counts = df['medical_history'].value_counts().head(8).to_dict()

        # 4. Diabetes Risk Distribution
        diabetes_risk_dist = df['diabetes_risk'].value_counts().to_dict()

        # 5. Heart Risk Distribution
        heart_risk_dist = df['heart_risk'].value_counts().to_dict()

        # 6. Monthly patient registration
        if 'registration_date' in df.columns:
            df['reg_month'] = pd.to_datetime(df['registration_date'], errors='coerce').dt.strftime('%b %Y')
            month_counts = df['reg_month'].value_counts().sort_index().to_dict()
        else:
            month_counts = {}

        # 7. Average BP by age group
        bp_by_age = df.groupby('age_group', observed=False)[['systolic_bp', 'diastolic_bp']].mean().round(1).to_dict('index')

        # 8. Glucose Level Distribution
        glucose_bins = [0, 100, 125, 200, 400]
        glucose_labels = ['Normal (<100)', 'Pre-diabetic (100-125)', 'Diabetic (126-200)', 'Severe (>200)']
        df['glucose_cat'] = pd.cut(df['glucose_level'], bins=glucose_bins, labels=glucose_labels)
        glucose_dist = df['glucose_cat'].value_counts().reindex(glucose_labels).fillna(0).to_dict()

        # 9. BMI Distribution
        bmi_dist = df['bmi_category'].value_counts().to_dict()

        return {
            'cards': {
                'total_patients': total_patients,
                'male_patients': male_patients,
                'female_patients': female_patients,
                'avg_age': avg_age,
                'diabetes_risk_patients': diabetes_risk_patients,
                'heart_risk_patients': heart_risk_patients,
                'healthy_patients': healthy_patients,
                'total_medical_records': total_records
            },
            'charts': {
                'age_groups': age_group_dist,
                'gender_distribution': gender_dist,
                'disease_distribution': disease_counts,
                'diabetes_risk_distribution': diabetes_risk_dist,
                'heart_risk_distribution': heart_risk_dist,
                'monthly_registration': month_counts,
                'blood_pressure_by_age': bp_by_age,
                'glucose_distribution': glucose_dist,
                'bmi_distribution': bmi_dist
            }
        }

    @classmethod
    def get_full_analytics(cls):
        """Performs deep Exploratory Data Analysis (EDA) on patient records."""
        df = cls.get_patients_df()
        if df.empty:
            return {'error': 'No patient data available.'}

        numeric_cols = [
            'age', 'height', 'weight', 'bmi', 'systolic_bp', 'diastolic_bp',
            'heart_rate', 'body_temperature', 'glucose_level', 'cholesterol'
        ]

        # Descriptive Statistics
        stats = {}
        for col in numeric_cols:
            if col in df.columns:
                series = df[col].dropna()
                stats[col] = {
                    'count': int(series.count()),
                    'mean': round(float(series.mean()), 2),
                    'median': round(float(series.median()), 2),
                    'std': round(float(series.std()), 2),
                    'min': round(float(series.min()), 2),
                    'max': round(float(series.max()), 2),
                    'skewness': round(float(series.skew()), 2)
                }

        # Missing values detection
        missing_df = DataPreprocessor.detect_missing_values(df)
        missing_info = missing_df.to_dict('index')

        # Duplicate records detection
        duplicate_count = int(df.duplicated(subset=['full_name', 'age', 'gender']).sum())

        # Outlier detection via IQR
        outliers_info = DataPreprocessor.detect_outliers_iqr(df, numeric_cols)

        # Pearson Correlation Matrix
        corr_matrix = df[numeric_cols].corr().round(3).to_dict()

        return {
            'total_records': len(df),
            'duplicate_records': duplicate_count,
            'missing_values': missing_info,
            'statistics': stats,
            'outliers': outliers_info,
            'correlation_matrix': corr_matrix,
            'features': numeric_cols
        }
