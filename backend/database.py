import os
import sqlite3
import pymysql
from pymysql.cursors import DictCursor
from config import Config

class Database:
    _instance = None
    _active_engine = None  # 'mysql' or 'sqlite'

    @classmethod
    def get_active_engine(cls):
        if cls._active_engine is None:
            cls.init_db()
        return cls._active_engine

    @classmethod
    def get_connection(cls):
        engine = cls.get_active_engine()
        if engine == 'mysql':
            return pymysql.connect(
                host=Config.MYSQL_HOST,
                port=Config.MYSQL_PORT,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DB,
                cursorclass=DictCursor,
                autocommit=True
            )
        else:
            conn = sqlite3.connect(Config.SQLITE_PATH)
            conn.row_factory = sqlite3.Row
            return conn

    @classmethod
    def init_db(cls):
        """Initializes database schema, attempting MySQL first if configured, else SQLite."""
        os.makedirs(Config.DATA_DIR, exist_ok=True)
        os.makedirs(Config.UPLOAD_DIR, exist_ok=True)
        os.makedirs(Config.MODELS_DIR, exist_ok=True)

        if Config.DB_TYPE in ('mysql', 'auto'):
            try:
                # Try connecting to MySQL server
                temp_conn = pymysql.connect(
                    host=Config.MYSQL_HOST,
                    port=Config.MYSQL_PORT,
                    user=Config.MYSQL_USER,
                    password=Config.MYSQL_PASSWORD,
                    autocommit=True
                )
                with temp_conn.cursor() as cursor:
                    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.MYSQL_DB}` CHARACTER SET utf8mb4;")
                temp_conn.close()

                mysql_conn = pymysql.connect(
                    host=Config.MYSQL_HOST,
                    port=Config.MYSQL_PORT,
                    user=Config.MYSQL_USER,
                    password=Config.MYSQL_PASSWORD,
                    database=Config.MYSQL_DB,
                    autocommit=True
                )
                with mysql_conn.cursor() as cursor:
                    cls._create_mysql_tables(cursor)
                mysql_conn.close()
                cls._active_engine = 'mysql'
                print(f"[Database] Successfully connected to MySQL at {Config.MYSQL_HOST}:{Config.MYSQL_PORT}/{Config.MYSQL_DB}")
                return
            except Exception as e:
                if Config.DB_TYPE == 'mysql':
                    print(f"[Database] Error connecting to MySQL: {e}")
                    raise e
                print(f"[Database] MySQL connection unavailable ({e}). Seamlessly switching to SQLite for demo...")

        # SQLite Fallback / Default
        cls._active_engine = 'sqlite'
        conn = sqlite3.connect(Config.SQLITE_PATH)
        cursor = conn.cursor()
        cls._create_sqlite_tables(cursor)
        conn.commit()
        conn.close()
        print(f"[Database] Active database: SQLite at {Config.SQLITE_PATH}")

    @classmethod
    def _create_mysql_tables(cls, cursor):
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id VARCHAR(30) NOT NULL UNIQUE,
            full_name VARCHAR(120) NOT NULL,
            age INT NOT NULL,
            gender VARCHAR(10) NOT NULL,
            height DECIMAL(5,2) NOT NULL,
            weight DECIMAL(5,2) NOT NULL,
            bmi DECIMAL(5,2) NOT NULL,
            bmi_category VARCHAR(30) NOT NULL,
            blood_group VARCHAR(10) NOT NULL,
            systolic_bp INT NOT NULL,
            diastolic_bp INT NOT NULL,
            heart_rate INT NOT NULL,
            body_temperature DECIMAL(4,1) NOT NULL,
            glucose_level DECIMAL(6,2) NOT NULL,
            cholesterol DECIMAL(6,2) DEFAULT 185.0,
            smoking_status VARCHAR(30) NOT NULL,
            physical_activity VARCHAR(30) NOT NULL,
            medical_history TEXT,
            diabetes_risk VARCHAR(20) DEFAULT 'Low',
            heart_risk VARCHAR(20) DEFAULT 'Low',
            registration_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        cursor.execute("""
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
            FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id VARCHAR(30),
            prediction_type VARCHAR(50) NOT NULL,
            model_used VARCHAR(50) NOT NULL,
            input_features TEXT NOT NULL,
            risk_score DECIMAL(5,2) NOT NULL,
            risk_category VARCHAR(20) NOT NULL,
            feature_importance TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

    @classmethod
    def _create_sqlite_tables(cls, cursor):
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            height REAL NOT NULL,
            weight REAL NOT NULL,
            bmi REAL NOT NULL,
            bmi_category TEXT NOT NULL,
            blood_group TEXT NOT NULL,
            systolic_bp INTEGER NOT NULL,
            diastolic_bp INTEGER NOT NULL,
            heart_rate INTEGER NOT NULL,
            body_temperature REAL NOT NULL,
            glucose_level REAL NOT NULL,
            cholesterol REAL DEFAULT 185.0,
            smoking_status TEXT NOT NULL,
            physical_activity TEXT NOT NULL,
            medical_history TEXT,
            diabetes_risk TEXT DEFAULT 'Low',
            heart_risk TEXT DEFAULT 'Low',
            registration_date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS medical_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            record_type TEXT NOT NULL,
            diagnosis TEXT NOT NULL,
            doctor_name TEXT NOT NULL,
            treatment_plan TEXT,
            notes TEXT,
            record_date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT,
            prediction_type TEXT NOT NULL,
            model_used TEXT NOT NULL,
            input_features TEXT NOT NULL,
            risk_score REAL NOT NULL,
            risk_category TEXT NOT NULL,
            feature_importance TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

    @classmethod
    def query(cls, query_str, args=(), one=False):
        """Unified query method that works seamlessly across MySQL and SQLite."""
        engine = cls.get_active_engine()
        # Convert parameter placeholders: MySQL uses %s, SQLite uses ?
        if engine == 'sqlite':
            q = query_str.replace('%s', '?')
        else:
            q = query_str.replace('?', '%s')

        conn = cls.get_connection()
        try:
            if engine == 'mysql':
                with conn.cursor() as cursor:
                    cursor.execute(q, args)
                    res = cursor.fetchall()
                    return (res[0] if res else None) if one else res
            else:
                cursor = conn.cursor()
                cursor.execute(q, args)
                rows = cursor.fetchall()
                # Convert SQLite Rows to regular dicts
                res = [dict(row) for row in rows]
                return (res[0] if res else None) if one else res
        finally:
            conn.close()

    @classmethod
    def execute(cls, query_str, args=()):
        """Unified execution for INSERT, UPDATE, DELETE returning lastrowid."""
        engine = cls.get_active_engine()
        if engine == 'sqlite':
            q = query_str.replace('%s', '?')
        else:
            q = query_str.replace('?', '%s')

        conn = cls.get_connection()
        try:
            if engine == 'mysql':
                with conn.cursor() as cursor:
                    cursor.execute(q, args)
                    conn.commit()
                    return cursor.lastrowid
            else:
                cursor = conn.cursor()
                cursor.execute(q, args)
                conn.commit()
                return cursor.lastrowid
        finally:
            conn.close()

    @classmethod
    def execute_many(cls, query_str, args_list):
        engine = cls.get_active_engine()
        if engine == 'sqlite':
            q = query_str.replace('%s', '?')
        else:
            q = query_str.replace('?', '%s')

        conn = cls.get_connection()
        try:
            if engine == 'mysql':
                with conn.cursor() as cursor:
                    cursor.executemany(q, args_list)
                    conn.commit()
            else:
                cursor = conn.cursor()
                cursor.executemany(q, args_list)
                conn.commit()
        finally:
            conn.close()
