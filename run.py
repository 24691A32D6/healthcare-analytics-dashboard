#!/usr/bin/env python3
"""
Healthcare Data Analytics & Disease Prediction System
One-click application launcher.
"""
import os
import sys

# Ensure backend directory is in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')
sys.path.insert(0, BACKEND_DIR)

from app import app, initialize_app
from config import Config

if __name__ == '__main__':
    initialize_app()
    port = int(os.environ.get('PORT', 5000))
    print(f"\n=======================================================")
    print(f" MediPulse Healthcare Analytics & Disease Prediction")
    print(f" Access Web Application at: http://127.0.0.1:{port}")
    print(f"=======================================================\n")
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
