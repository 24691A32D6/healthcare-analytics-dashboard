# MediPulse: Healthcare Data Analytics & Disease Prediction System

A complete, working, full-stack **Healthcare Data Analytics & Disease Prediction System** designed and built for college engineering project demonstrations and academic evaluation.

---

## 1. System Overview & Architecture

MediPulse is an end-to-end clinical intelligence platform combining modern reactive web design, a Python Flask REST API, dual-engine database storage (MySQL & SQLite fallback), deep statistical analytics (Pandas, NumPy, Seaborn), and supervised machine learning pipelines (Scikit-Learn: Random Forest, Logistic Regression, Decision Tree).

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND INTERFACE (React.js SPA)                    │
│   • Executive Dashboard (8 KPI Cards, 10 Interactive Chart.js Visuals) │
│   • Patient Record Management (CRUD, Auto-BMI Calculation & Search)    │
│   • Healthcare Analytics & EDA (Parametric Stats, Outliers, Correlation)│
│   • Disease Prediction ML Forms (Diabetes & Cardiovascular Assessments) │
│   • Dataset Schema Profiling & Printable Academic Clinical Reports     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      BACKEND REST API (Flask Core)                     │
│   • /api/patients    - CRUD operations, automatic clinical risk scoring│
│   • /api/analytics   - Descriptive stats, IQR outliers, Pearson matrix │
│   • /api/predict     - Model inference, evaluation metrics & factors   │
│   • /api/datasets    - File uploads, schema inspection, data profiling │
└─────────────┬─────────────────────┬────────────────────┬───────────────┘
              │                     │                    │
              ▼                     ▼                    ▼
┌─────────────────────────┐ ┌───────────────┐ ┌──────────────────────────┐
│     DATABASE ENGINE     │ │  ML PIPELINE  │ │     ANALYTICS ENGINE     │
│   • MySQL (Production)  │ │ • Random Forest│ │ • Pandas & NumPy Core   │
│   • SQLite (Zero-Config)│ │ • Logistic Reg│ │ • Matplotlib & Seaborn   │
│   • 3 Normalized Tables │ │ • Decision Tree│ │ • Base64 Plot Visualizer │
└─────────────────────────┘ └───────────────┘ └──────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), React.js 18, Tailwind CSS, Chart.js 4, Font Awesome 6 |
| **Backend** | Python 3.12, Flask 3.1, Flask-CORS, Werkzeug |
| **Data Analytics** | Pandas 2.2, NumPy 2.0, Matplotlib 3.11, Seaborn 0.13, Scipy 1.18 |
| **Machine Learning** | Scikit-Learn 1.9 (Random Forest, Logistic Regression, Decision Tree, StandardScaler, ROC Curves) |
| **Database** | MySQL / MariaDB (native connector via PyMySQL), with seamless SQLite auto-fallback |
| **Architecture** | RESTful API with separation of routes, models, analytics, and presentation |

---

## 3. Core Modules & Features

### 3.1 Executive Dashboard
- **8 KPI Cards:** Total Patients, Male Patients, Female Patients, Average Patient Age, Diabetes-Risk Patients, Heart-Risk Patients, Healthy Baseline Patients, and Total Medical Records.
- **10 Interactive Chart.js Visualizations:**
  1. *Patients by Age Group* (<20, 20-39, 40-59, 60+).
  2. *Gender Distribution* (Doughnut chart with demographic percentages).
  3. *Prevalence of Chronic Medical Conditions* (Bar chart of diagnosed cases).
  4. *Diabetes Risk Stratification* (Low, Moderate, High risk distribution).
  5. *Cardiovascular Risk Stratification* (Low, Moderate, High risk distribution).
  6. *Monthly Patient Registration Trend* (Smooth area line chart).
  7. *Average Blood Pressure by Age Group* (Dual column: Systolic vs Diastolic).
  8. *Fasting Glucose Clinical Categories* (Normal, Impaired, Diabetic, Severe).
  9. *Body Mass Index (BMI) Distribution* (Underweight, Normal, Overweight, Obese).
  10. *Comprehensive Population Health Biometric Radar* (Multi-axis summary).

### 3.2 Patient Management
- **Full CRUD Operations:** Add, View, Edit, and Delete patient records.
- **Automatic BMI Calculation:** Dynamically calculates $BMI = \frac{\text{Weight (kg)}}{(\text{Height (m)})^2}$ in real-time as measurements are typed.
- **Clinical Categorization:** Assigns WHO BMI categories (Underweight, Normal, Overweight, Obese).
- **Comprehensive Fields:** Patient ID, Full Name, Age, Gender, Height, Weight, BMI, Blood Group, Blood Pressure (Systolic/Diastolic), Heart Rate, Body Temperature, Fasting Glucose, Serum Cholesterol, Smoking Status, Physical Activity, Medical History, and Registration Date.
- **Search, Multi-Filter & Sort:** Live text search across names and diagnoses; multi-filtering by gender and risk levels; column sorting.
- **Individual Patient Dossier:** Detailed clinical profile modal with vitals breakdown, consultation progress notes history, doctor note creation, and one-click **"Transfer to ML Prediction"** button.

### 3.3 Healthcare Data Analytics & EDA
- **Descriptive Parametric Statistics:** Count, mean, median, standard deviation, minimum, maximum, and skewness across all clinical vitals.
- **Outlier Detection via Tukey's IQR Method:** Computes $Q_1$, $Q_3$, $IQR = Q_3 - Q_1$, lower threshold ($Q_1 - 1.5 \times IQR$), upper threshold ($Q_3 + 1.5 \times IQR$), outlier counts, and percentages for physiological vitals.
- **Interactive Pearson Correlation Matrix:** Dynamic color-coded matrix displaying linear correlation coefficients ($r$) between clinical features.
- **Seaborn High-Resolution Plots:** Backend generates 7 publication-quality graphs encoded as base64 images:
  - *Correlation Heatmap* (`cmap="YlGnBu"`)
  - *Age Distribution with Kernel Density Estimate (KDE)*
  - *BMI Distribution with WHO Category Cutoffs*
  - *Fasting Blood Glucose Distribution*
  - *Blood Pressure Dual Density (Systolic vs Diastolic)*
  - *Gender Proportion Chart*
  - *Prevalence of Comorbidities Bar Plot*
- **Data Preprocessing & Quality:** Missing value audit, duplicate record check, and StandardScaler normalization.

### 3.4 Supervised Machine Learning Module
- **Dual Pathology Prediction:**
  - **Type 2 Diabetes Risk Prediction:** Features include *Age, BMI, Glucose, Diastolic Blood Pressure, Insulin, Physical Activity, Family History*.
  - **Cardiovascular Disease Risk Prediction:** Features include *Age, Gender, Systolic BP, Cholesterol, Heart Rate, BMI, Smoking Status, Physical Activity, Exercise-Induced Angina*.
- **Supervised Classifiers Implemented:**
  1. *Random Forest Classifier* (`n_estimators=100, max_depth=6`)
  2. *Logistic Regression* (`max_iter=1000`)
  3. *Decision Tree Classifier* (`max_depth=5`)
- **Evaluation Standards (Zero Data Leakage):**
  - Models are trained on an 80% train split and strictly evaluated on a 20% stratified held-out test set.
  - Displays Test Accuracy, Precision, Recall/Sensitivity, F1-Score, and ROC-AUC scores.
  - Interactive Visual Confusion Matrix: True Negatives, False Positives, False Negatives, and True Positives.
- **Prediction Interface:**
  - Enter custom patient measurements or load one-click clinical presets (*Healthy Baseline*, *Moderate Risk*, *High Risk Profile*).
  - Risk probability meter (0% to 100%) and 3-tier clinical classification (*Low Risk*, *Moderate Risk*, *High Risk*).
  - Feature impact explanation (highlights which biometric markers drove the elevated risk).
  - Prominent educational and research disclaimer.

### 3.5 Dataset Management & Reporting
- **Bundled Benchmark Datasets:** Includes `patients_seed.csv` (160 patient records), `diabetes_data.csv` (1,000 samples modeled on Pima Indians Diabetes), and `heart_disease_data.csv` (1,000 samples modeled on UCI Cleveland Heart Disease).
- **Custom CSV Upload:** Upload custom healthcare datasets with instant validation.
- **Column Schema Profiling:** Identifies inferred data types, null counts, null percentages, unique value cardinalities, and sample observations.
- **Data Preview Table:** Displays first 50 rows of any dataset with horizontal scroll.
- **Printable Medical Evaluation Report:** Formal clinical report layout with printable styling (`@media print`) and signature block for faculty/external examiners.

---

## 4. Database Setup & Configuration

### Option A: Automatic SQLite (Zero Configuration - Out of the Box)
By default, the application is pre-configured to automatically initialize a local SQLite database at `backend/data/healthcare.db` if MySQL is not detected. This allows the project to run immediately on any laptop without requiring database installation!

### Option B: MySQL / MariaDB (XAMPP or MySQL Server)
To connect the system to MySQL:
1. Start MySQL in XAMPP or via Windows Services.
2. The default credentials are set to `root` with no password on `localhost:3306`.
3. To customize connection parameters, set environment variables or edit `backend/config.py`:
   ```python
   MYSQL_HOST = 'localhost'
   MYSQL_PORT = 3306
   MYSQL_USER = 'root'
   MYSQL_PASSWORD = 'your_mysql_password'
   MYSQL_DB = 'healthcare_db'
   ```
4. A full SQL DDL script is provided in `backend/schema.sql`. You can optionally import it in MySQL Workbench or phpMyAdmin:
   ```sql
   SOURCE backend/schema.sql;
   ```
5. On startup, the application verifies the MySQL connection, automatically creates `healthcare_db` and all tables if they do not exist, and seeds 160 realistic patient records!

---

## 5. Quick Start & Execution Guide

### Prerequisites
- Python 3.10+ installed
- Web browser (Chrome, Edge, Firefox)

### Step 1: Install Python Dependencies
```bash
python -m pip install -r requirements.txt
```

### Step 2: Run Automated Test Suite
Verify backend routes, database integrity, analytics engine, and machine learning models:
```bash
python backend/tests/test_api.py
```
*(All 9 automated unit tests will pass with code 0).*

### Step 3: Launch the Application
Run the one-click startup script:
```bash
python run.py
```
Or run Flask directly:
```bash
python backend/app.py
```

### Step 4: Access Web Application
Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 6. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check, active database engine, and patient count |
| `GET` | `/api/patients` | Query patients with search, filters (`gender`, `diabetes_risk`, `heart_risk`, `bmi_category`), and sorting |
| `POST` | `/api/patients` | Add a new patient record (auto-calculates BMI and category) |
| `GET` | `/api/patients/<id>` | Fetch detailed patient profile, medical records, and prediction history |
| `PUT` | `/api/patients/<id>` | Update patient information and recompute BMI |
| `DELETE` | `/api/patients/<id>` | Delete patient and cascading clinical records |
| `POST` | `/api/patients/<id>/records` | Record a new doctor consultation or clinical progress note |
| `GET` | `/api/analytics/dashboard` | Aggregated metrics for the 8 KPI cards and 10 interactive charts |
| `GET` | `/api/analytics/eda` | Summary statistics, IQR outlier statistics, and Pearson correlation matrix |
| `GET` | `/api/analytics/plots` | Base64-encoded Matplotlib & Seaborn high-resolution plots |
| `GET` | `/api/predict/metrics/<type>` | Model evaluation benchmarks (Accuracy, Precision, Recall, F1, AUC, Confusion Matrix) |
| `POST` | `/api/predict/diabetes` | Classify diabetes risk using Random Forest, Logistic Reg, or Decision Tree |
| `POST` | `/api/predict/heart` | Classify cardiovascular risk using Random Forest, Logistic Reg, or Decision Tree |
| `GET` | `/api/predict/history` | Audit log of recent ML risk predictions stored in database |
| `GET` | `/api/datasets/list` | List preloaded benchmark and uploaded CSV datasets |
| `GET` | `/api/datasets/preview/<id>` | Column schema profiling and 50-row preview |
| `POST` | `/api/datasets/upload` | Upload custom CSV dataset file |

---

## 7. Educational & Research Disclaimer

> **IMPORTANT:** This software system is developed strictly for college engineering demonstration and educational research purposes. The predictive risk categories and statistical models are algorithmic simulations and **do not constitute clinical medical diagnosis or treatment advice**. Always consult certified healthcare professionals for personal health decisions.
