from flask import Blueprint, jsonify
from analytics.engine import AnalyticsEngine
from analytics.visualizer import Visualizer

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    """Returns aggregated KPI cards and interactive chart datasets for the main dashboard."""
    try:
        data = AnalyticsEngine.get_dashboard_summary()
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/eda', methods=['GET'])
def get_eda_data():
    """Returns deep Exploratory Data Analysis metrics, outlier statistics, and correlation matrix."""
    try:
        data = AnalyticsEngine.get_full_analytics()
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/plots', methods=['GET'])
def get_eda_plots():
    """Generates and returns base64 Seaborn/Matplotlib visualization images."""
    try:
        plots = Visualizer.generate_all_eda_plots()
        return jsonify({'success': True, 'plots': plots})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
