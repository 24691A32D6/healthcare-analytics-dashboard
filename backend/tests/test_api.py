import os
import sys
import unittest
import json

# Setup import path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, BACKEND_DIR)

from app import app, initialize_app

class HealthcareAPITestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        initialize_app()
        cls.client = app.test_client()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertIn(data['database_engine'], ['mysql', 'sqlite'])
        print(f"Health check OK: Database engine is {data['database_engine']}, patients: {data['patients_in_db']}")

    def test_02_patients_list(self):
        res = self.client.get('/api/patients')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertGreater(data['count'], 0)
        print(f"Patients list OK: {data['count']} patients found.")

    def test_03_patient_add_and_delete(self):
        new_patient = {
            'patient_id': 'PID-TEST-999',
            'full_name': 'Test Evaluation Patient',
            'age': 52,
            'gender': 'Male',
            'height': 178,
            'weight': 82,
            'blood_group': 'B+',
            'systolic_bp': 135,
            'diastolic_bp': 88,
            'heart_rate': 76,
            'glucose_level': 118,
            'smoking_status': 'Former',
            'physical_activity': 'Moderate',
            'medical_history': 'Borderline Hypertension'
        }
        # Create
        res = self.client.post('/api/patients', json=new_patient)
        self.assertEqual(res.status_code, 201)
        created = res.get_json()
        self.assertTrue(created['success'])

        # Verify profile
        res_get = self.client.get('/api/patients/PID-TEST-999')
        self.assertEqual(res_get.status_code, 200)
        p_data = res_get.get_json()['patient']
        self.assertEqual(p_data['full_name'], 'Test Evaluation Patient')
        self.assertAlmostEqual(p_data['bmi'], 25.9, places=1) # 82 / (1.78^2)

        # Delete
        res_del = self.client.delete('/api/patients/PID-TEST-999')
        self.assertEqual(res_del.status_code, 200)
        print("Patient Add, Calculate BMI, and Delete test OK.")

    def test_04_dashboard_analytics(self):
        res = self.client.get('/api/analytics/dashboard')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        cards = data['data']['cards']
        charts = data['data']['charts']
        self.assertIn('total_patients', cards)
        self.assertIn('age_groups', charts)
        self.assertIn('disease_distribution', charts)
        print(f"Dashboard analytics OK: Total patients={cards['total_patients']}, Avg Age={cards['avg_age']}")

    def test_05_eda_analytics(self):
        res = self.client.get('/api/analytics/eda')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('statistics', data['data'])
        self.assertIn('outliers', data['data'])
        self.assertIn('correlation_matrix', data['data'])
        print("EDA Analytics OK: Full descriptive statistics and Pearson correlation matrix computed.")

    def test_06_visualizer_plots(self):
        res = self.client.get('/api/analytics/plots')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        plots = data['plots']
        self.assertIn('correlation_heatmap', plots)
        self.assertIn('age_distribution', plots)
        self.assertGreater(len(plots['correlation_heatmap']), 500) # Valid base64 image
        print("Visualizer Plots OK: Correlation heatmap and distributions generated as base64 images.")

    def test_07_diabetes_prediction(self):
        payload = {
            'age': 58,
            'bmi': 33.5,
            'glucose': 165,
            'blood_pressure': 88,
            'insulin': 180,
            'physical_activity': 0, # Sedentary
            'family_history': 1,
            'model': 'random_forest'
        }
        res = self.client.post('/api/predict/diabetes', json=payload)
        self.assertEqual(res.status_code, 200)
        result = res.get_json()['result']
        self.assertIn('risk_score', result)
        self.assertIn('risk_category', result)
        self.assertIn('contributing_factors', result)
        self.assertIn('disclaimer', result)
        print(f"Diabetes Prediction OK: Risk={result['risk_score']}%, Category={result['risk_category']}, Factors={len(result['contributing_factors'])}")

    def test_08_heart_prediction(self):
        payload = {
            'age': 62,
            'gender': 'Male',
            'systolic_bp': 155,
            'cholesterol': 265,
            'heart_rate': 84,
            'bmi': 31.0,
            'smoking_status': 2, # Current
            'physical_activity': 0,
            'exercise_angina': 1,
            'model': 'random_forest'
        }
        res = self.client.post('/api/predict/heart', json=payload)
        self.assertEqual(res.status_code, 200)
        result = res.get_json()['result']
        self.assertIn('risk_score', result)
        self.assertIn('risk_category', result)
        self.assertIn('disclaimer', result)
        print(f"Heart Disease Prediction OK: Risk={result['risk_score']}%, Category={result['risk_category']}")

    def test_09_datasets_api(self):
        res = self.client.get('/api/datasets/list')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertGreater(len(data['datasets']), 0)

        preview_res = self.client.get('/api/datasets/preview/patients_seed.csv')
        self.assertEqual(preview_res.status_code, 200)
        p_data = preview_res.get_json()
        self.assertTrue(p_data['success'])
        self.assertGreater(p_data['row_count'], 0)
        print(f"Datasets API OK: Found {len(data['datasets'])} datasets, previewed {p_data['row_count']} rows.")

if __name__ == '__main__':
    unittest.main()
