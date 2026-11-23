import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler

class DataPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.imputers = {}
        self.feature_names = []

    @staticmethod
    def detect_missing_values(df):
        """Returns missing value counts and percentages per column."""
        total = df.isnull().sum()
        percent = (df.isnull().sum() / len(df)) * 100
        return pd.DataFrame({'missing_count': total, 'percentage': percent.round(2)})

    @staticmethod
    def handle_missing_values(df, strategy='median'):
        """Imputes missing values with median for numeric and mode for categorical."""
        df_clean = df.copy()
        for col in df_clean.columns:
            if df_clean[col].isnull().sum() > 0:
                if pd.api.types.is_numeric_dtype(df_clean[col]):
                    if strategy == 'mean':
                        val = df_clean[col].mean()
                    else:
                        val = df_clean[col].median()
                    df_clean[col].fillna(val, inplace=True)
                else:
                    mode_val = df_clean[col].mode()
                    if not mode_val.empty:
                        df_clean[col].fillna(mode_val[0], inplace=True)
        return df_clean

    @staticmethod
    def detect_outliers_iqr(df, columns=None):
        """Detects outliers using the Interquartile Range (IQR) method."""
        if columns is None:
            columns = df.select_dtypes(include=[np.number]).columns.tolist()

        outlier_info = {}
        for col in columns:
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
            outlier_info[col] = {
                'lower_bound': round(float(lower_bound), 2),
                'upper_bound': round(float(upper_bound), 2),
                'q1': round(float(q1), 2),
                'q3': round(float(q3), 2),
                'iqr': round(float(iqr), 2),
                'outlier_count': int(len(outliers)),
                'outlier_percentage': round(float(len(outliers) / len(df) * 100), 2)
            }
        return outlier_info

    @staticmethod
    def cap_outliers_iqr(df, columns=None):
        """Caps outliers at lower and upper IQR boundaries."""
        df_capped = df.copy()
        if columns is None:
            columns = df_capped.select_dtypes(include=[np.number]).columns.tolist()

        for col in columns:
            q1 = df_capped[col].quantile(0.25)
            q3 = df_capped[col].quantile(0.75)
            iqr = q3 - q1
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr
            df_capped[col] = np.clip(df_capped[col], lower, upper)
        return df_capped

    @staticmethod
    def normalize_features(df, columns, method='standard'):
        """Scales numeric features using StandardScaler or MinMaxScaler."""
        df_norm = df.copy()
        scaler = StandardScaler() if method == 'standard' else MinMaxScaler()
        df_norm[columns] = scaler.fit_transform(df_norm[columns])
        return df_norm, scaler
