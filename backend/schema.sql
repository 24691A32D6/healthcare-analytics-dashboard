-- Healthcare Data Analytics & Disease Prediction System
-- Database Schema for MySQL / MariaDB (and SQLite compatible)

CREATE DATABASE IF NOT EXISTS healthcare_db;
USE healthcare_db;

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    height DECIMAL(5,2) NOT NULL,        -- Height in cm (e.g. 175.00)
    weight DECIMAL(5,2) NOT NULL,        -- Weight in kg (e.g. 72.50)
    bmi DECIMAL(5,2) NOT NULL,           -- Auto-calculated: weight / (height/100)^2
    bmi_category VARCHAR(30) NOT NULL,   -- Underweight, Normal, Overweight, Obese
    blood_group VARCHAR(10) NOT NULL,    -- A+, A-, B+, B-, AB+, AB-, O+, O-
    systolic_bp INT NOT NULL,            -- Blood pressure systolic (mmHg)
    diastolic_bp INT NOT NULL,           -- Blood pressure diastolic (mmHg)
    heart_rate INT NOT NULL,             -- bpm
    body_temperature DECIMAL(4,1) NOT NULL, -- Celsius (e.g. 36.8)
    glucose_level DECIMAL(6,2) NOT NULL, -- mg/dL (e.g. 105.0)
    cholesterol DECIMAL(6,2) DEFAULT 185.0, -- mg/dL
    smoking_status VARCHAR(30) NOT NULL, -- Never, Former, Current
    physical_activity VARCHAR(30) NOT NULL, -- Sedentary, Moderate, Active
    medical_history TEXT,                -- Chronic conditions, allergies, etc.
    diabetes_risk VARCHAR(20) DEFAULT 'Low', -- Low, Moderate, High
    heart_risk VARCHAR(20) DEFAULT 'Low',    -- Low, Moderate, High
    registration_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_id (patient_id),
    INDEX idx_age (age),
    INDEX idx_gender (gender),
    INDEX idx_diabetes_risk (diabetes_risk),
    INDEX idx_heart_risk (heart_risk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(30) NOT NULL,
    record_type VARCHAR(60) NOT NULL,
    diagnosis VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(120) NOT NULL,
    treatment_plan TEXT,
    notes TEXT,
    record_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    INDEX idx_record_patient (patient_id),
    INDEX idx_record_date (record_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Prediction History Table
CREATE TABLE IF NOT EXISTS prediction_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(30),
    prediction_type VARCHAR(50) NOT NULL,  -- 'Diabetes Risk' or 'Heart Disease Risk'
    model_used VARCHAR(50) NOT NULL,       -- 'Random Forest', 'Logistic Regression', 'Decision Tree'
    input_features TEXT NOT NULL,          -- JSON serialized input values
    risk_score DECIMAL(5,2) NOT NULL,      -- Percentage probability (0.0 to 100.0)
    risk_category VARCHAR(20) NOT NULL,    -- 'Low', 'Moderate', 'High'
    feature_importance TEXT,               -- JSON serialized feature contributions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pred_type (prediction_type),
    INDEX idx_pred_category (risk_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
