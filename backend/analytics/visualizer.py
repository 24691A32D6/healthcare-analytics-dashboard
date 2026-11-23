import io
import base64
import matplotlib
matplotlib.use('Agg') # Headless background backend
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from analytics.engine import AnalyticsEngine

# Medical visual palette
PALETTE = ['#0284c7', '#0d9488', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
sns.set_theme(style="whitegrid", font="sans-serif")

def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=120)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')

class Visualizer:

    @classmethod
    def generate_all_eda_plots(cls):
        """Generates all 7 specified EDA graphs and returns as base64 strings."""
        df = AnalyticsEngine.get_patients_df()
        if df.empty:
            return {}

        plots = {}
        plots['correlation_heatmap'] = cls.plot_correlation_heatmap(df)
        plots['age_distribution'] = cls.plot_age_distribution(df)
        plots['bmi_distribution'] = cls.plot_bmi_distribution(df)
        plots['glucose_distribution'] = cls.plot_glucose_distribution(df)
        plots['bp_distribution'] = cls.plot_bp_distribution(df)
        plots['gender_distribution'] = cls.plot_gender_distribution(df)
        plots['disease_distribution'] = cls.plot_disease_distribution(df)
        return plots

    @classmethod
    def plot_correlation_heatmap(cls, df):
        fig, ax = plt.subplots(figsize=(8, 6))
        numeric_cols = ['age', 'bmi', 'systolic_bp', 'diastolic_bp', 'heart_rate', 'glucose_level', 'cholesterol']
        corr = df[numeric_cols].corr()
        
        # Clean labels
        labels = [col.replace('_', ' ').title() for col in numeric_cols]
        sns.heatmap(
            corr, annot=True, fmt=".2f", cmap="YlGnBu", ax=ax,
            xticklabels=labels, yticklabels=labels, cbar_kws={'shrink': 0.8},
            linewidths=0.5
        )
        ax.set_title("Clinical Vitals Correlation Matrix (Pearson)", fontsize=13, fontweight='bold', pad=12, color='#0f172a')
        plt.xticks(rotation=40, ha='right', fontsize=9)
        plt.yticks(rotation=0, fontsize=9)
        return fig_to_base64(fig)

    @classmethod
    def plot_age_distribution(cls, df):
        fig, ax = plt.subplots(figsize=(7, 4.5))
        sns.histplot(df['age'], kde=True, color='#0284c7', ax=ax, bins=16, edgecolor='white')
        ax.axvline(df['age'].mean(), color='#ef4444', linestyle='--', linewidth=1.5, label=f"Mean: {df['age'].mean():.1f} yrs")
        ax.axvline(df['age'].median(), color='#10b981', linestyle=':', linewidth=1.5, label=f"Median: {df['age'].median():.1f} yrs")
        ax.set_title("Patient Age Distribution & Density", fontsize=12, fontweight='bold', pad=10, color='#0f172a')
        ax.set_xlabel("Age (Years)", fontsize=10)
        ax.set_ylabel("Patient Count", fontsize=10)
        ax.legend(frameon=True, facecolor='white', framealpha=0.9)
        return fig_to_base64(fig)

    @classmethod
    def plot_bmi_distribution(cls, df):
        fig, ax = plt.subplots(figsize=(7, 4.5))
        sns.histplot(df['bmi'], kde=True, color='#0d9488', ax=ax, bins=18, edgecolor='white')
        ax.axvline(18.5, color='#3b82f6', linestyle=':', linewidth=1.2, label='Normal (18.5)')
        ax.axvline(25.0, color='#f59e0b', linestyle='--', linewidth=1.2, label='Overweight (25.0)')
        ax.axvline(30.0, color='#ef4444', linestyle='--', linewidth=1.5, label='Obese (30.0)')
        ax.set_title("BMI Distribution Across Clinical Categories", fontsize=12, fontweight='bold', pad=10, color='#0f172a')
        ax.set_xlabel("Body Mass Index (kg/m²)", fontsize=10)
        ax.set_ylabel("Patient Count", fontsize=10)
        ax.legend(frameon=True, facecolor='white', framealpha=0.9)
        return fig_to_base64(fig)

    @classmethod
    def plot_glucose_distribution(cls, df):
        fig, ax = plt.subplots(figsize=(7, 4.5))
        sns.histplot(df['glucose_level'], kde=True, color='#8b5cf6', ax=ax, bins=18, edgecolor='white')
        ax.axvline(100, color='#10b981', linestyle=':', linewidth=1.3, label='Normal Threshold (100 mg/dL)')
        ax.axvline(126, color='#ef4444', linestyle='--', linewidth=1.5, label='Diabetes Threshold (126 mg/dL)')
        ax.set_title("Fasting Blood Glucose Distribution", fontsize=12, fontweight='bold', pad=10, color='#0f172a')
        ax.set_xlabel("Fasting Glucose (mg/dL)", fontsize=10)
        ax.set_ylabel("Patient Count", fontsize=10)
        ax.legend(frameon=True, facecolor='white', framealpha=0.9)
        return fig_to_base64(fig)

    @classmethod
    def plot_bp_distribution(cls, df):
        fig, ax = plt.subplots(figsize=(7, 4.5))
        sns.kdeplot(df['systolic_bp'], fill=True, color='#0284c7', label='Systolic BP', ax=ax, alpha=0.4)
        sns.kdeplot(df['diastolic_bp'], fill=True, color='#10b981', label='Diastolic BP', ax=ax, alpha=0.4)
        ax.axvline(120, color='#0284c7', linestyle='--', linewidth=1, label='Normal Systolic (120)')
        ax.axvline(80, color='#10b981', linestyle='--', linewidth=1, label='Normal Diastolic (80)')
        ax.set_title("Blood Pressure Distribution (Systolic vs Diastolic)", fontsize=12, fontweight='bold', pad=10, color='#0f172a')
        ax.set_xlabel("Pressure (mmHg)", fontsize=10)
        ax.set_ylabel("Density", fontsize=10)
        ax.legend(frameon=True, facecolor='white', framealpha=0.9)
        return fig_to_base64(fig)

    @classmethod
    def plot_gender_distribution(cls, df):
        fig, ax = plt.subplots(figsize=(5.5, 4.5))
        counts = df['gender'].value_counts()
        colors = ['#0284c7', '#ec4899']
        wedges, texts, autotexts = ax.pie(
            counts.values, labels=counts.index, autopct='%1.1f%%',
            startangle=140, colors=colors, wedgeprops=dict(width=0.45, edgecolor='white', linewidth=2)
        )
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
        ax.set_title("Patient Population by Gender", fontsize=12, fontweight='bold', pad=10, color='#0f172a')
        return fig_to_base64(fig)

    @classmethod
    def plot_disease_distribution(cls, df):
        fig, ax = plt.subplots(figsize=(8, 4.5))
        counts = df['medical_history'].value_counts().head(7)
        sns.barplot(x=counts.values, y=counts.index, hue=counts.index, palette='Blues_r', legend=False, ax=ax)
        ax.set_title("Prevalence of Chronic Medical Conditions", fontsize=12, fontweight='bold', pad=10, color='#0f172a')
        ax.set_xlabel("Number of Diagnosed Patients", fontsize=10)
        return fig_to_base64(fig)
