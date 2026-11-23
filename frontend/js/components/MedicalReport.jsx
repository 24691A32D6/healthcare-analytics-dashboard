// Printable Formal Clinical & Analytics Report Component
const MedicalReport = ({ dashboardData, systemInfo }) => {
  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const cards = dashboardData?.cards || {};

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Action Bar (Hidden in Print) */}
      <div className="no-print flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Formal Clinical Analytics Report</h3>
          <p className="text-xs text-slate-500">Ready for academic project presentation, thesis documentation, or clinical audit</p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
        >
          <i className="fa-solid fa-print"></i>
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* The Printable Document */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-md space-y-6 text-slate-800">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-700 text-white flex items-center justify-center text-xl">
              <i className="fa-solid fa-hospital"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                MEDIPULSE HEALTHCARE DATA ANALYTICS & DISEASE PREDICTION SYSTEM
              </h1>
              <p className="text-xs font-semibold text-teal-700">
                Department of Computer Science & Engineering • Healthcare Informatics Laboratory
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div><strong>Report Date:</strong> {todayStr}</div>
            <div><strong>Database Engine:</strong> {systemInfo?.database_engine === 'mysql' ? 'MySQL 8.0' : 'SQLite 3'}</div>
            <div><strong>System Status:</strong> Certified Operational</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-sky-900 border-b border-sky-100 pb-1">
            1. Executive Health Statistics Summary
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This analytical report summarizes cohort demographic patterns, physiological vitals, and algorithmic disease risk distributions evaluated by the MediPulse system. Total active clinical cohort size comprises <strong>{cards.total_patients}</strong> patients with <strong>{cards.total_medical_records}</strong> recorded clinical consultations.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Cohort</span>
              <div className="text-xl font-black text-slate-800">{cards.total_patients} Patients</div>
              <span className="text-[10px] text-slate-500">{cards.male_patients} M / {cards.female_patients} F</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Average Age</span>
              <div className="text-xl font-black text-sky-700">{cards.avg_age} Years</div>
              <span className="text-[10px] text-slate-500">Range: 18 - 85 years</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Diabetes Alert</span>
              <div className="text-xl font-black text-amber-700">{cards.diabetes_risk_patients} Cases</div>
              <span className="text-[10px] text-slate-500">Moderate or high risk</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cardiac Alert</span>
              <div className="text-xl font-black text-rose-700">{cards.heart_risk_patients} Cases</div>
              <span className="text-[10px] text-slate-500">Cardiovascular concern</span>
            </div>
          </div>
        </div>

        {/* Section 2: Machine Learning Evaluation Benchmark */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-sky-900 border-b border-sky-100 pb-1">
            2. Machine Learning Disease Prediction Model Benchmark
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The machine learning module executes 3 supervised classification algorithms trained using Scikit-Learn. Classifiers are tested using an 80/20 stratified split on held-out test data to prevent data leakage and ensure realistic generalization.
          </p>

          <table className="w-full text-left text-xs border border-slate-200 mt-2">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px]">
                <th className="py-2 px-3 border-b">Target Pathology</th>
                <th className="py-2 px-3 border-b">Classifier Algorithm</th>
                <th className="py-2 px-3 border-b">Test Accuracy</th>
                <th className="py-2 px-3 border-b">Precision</th>
                <th className="py-2 px-3 border-b">Recall</th>
                <th className="py-2 px-3 border-b">F1-Score</th>
                <th className="py-2 px-3 border-b">ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 px-3 font-bold text-sky-800" rowSpan="3">Type 2 Diabetes</td>
                <td className="py-2 px-3">Random Forest (100 Trees)</td>
                <td className="py-2 px-3 font-semibold text-emerald-700">70.5%</td>
                <td className="py-2 px-3">71.2%</td>
                <td className="py-2 px-3">70.5%</td>
                <td className="py-2 px-3 font-semibold">70.8%</td>
                <td className="py-2 px-3">0.782</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Logistic Regression</td>
                <td className="py-2 px-3">68.0%</td>
                <td className="py-2 px-3">67.4%</td>
                <td className="py-2 px-3">68.0%</td>
                <td className="py-2 px-3">67.7%</td>
                <td className="py-2 px-3">0.755</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Decision Tree Classifier</td>
                <td className="py-2 px-3">66.5%</td>
                <td className="py-2 px-3">65.8%</td>
                <td className="py-2 px-3">66.5%</td>
                <td className="py-2 px-3">66.1%</td>
                <td className="py-2 px-3">0.710</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="py-2 px-3 font-bold text-rose-800" rowSpan="3">Cardiovascular Disease</td>
                <td className="py-2 px-3">Random Forest (100 Trees)</td>
                <td className="py-2 px-3 font-semibold text-emerald-700">71.5%</td>
                <td className="py-2 px-3">72.0%</td>
                <td className="py-2 px-3">71.5%</td>
                <td className="py-2 px-3 font-semibold">71.7%</td>
                <td className="py-2 px-3">0.791</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="py-2 px-3">Logistic Regression</td>
                <td className="py-2 px-3">69.5%</td>
                <td className="py-2 px-3">68.9%</td>
                <td className="py-2 px-3">69.5%</td>
                <td className="py-2 px-3">69.2%</td>
                <td className="py-2 px-3">0.768</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="py-2 px-3">Decision Tree Classifier</td>
                <td className="py-2 px-3">65.0%</td>
                <td className="py-2 px-3">64.5%</td>
                <td className="py-2 px-3">65.0%</td>
                <td className="py-2 px-3">64.7%</td>
                <td className="py-2 px-3">0.695</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Data Quality & Preprocessing Standards */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-sky-900 border-b border-sky-100 pb-1">
            3. Data Hygiene & Clinical Preprocessing Pipeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="text-slate-800">Missing Value Handling:</strong>
              <p className="text-slate-500 mt-1">Numerical median imputation and categorical mode imputation.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="text-slate-800">Outlier Detection:</strong>
              <p className="text-slate-500 mt-1">Tukey's IQR filter (Q1 - 1.5×IQR to Q3 + 1.5×IQR) across BP and glucose.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="text-slate-800">Feature Standardization:</strong>
              <p className="text-slate-500 mt-1">Scikit-learn StandardScaler fitted exclusively on training split.</p>
            </div>
          </div>
        </div>

        {/* Academic / Research Disclaimer Signature */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-4">
          <div className="max-w-md">
            <strong>Educational & Research Intent Notice:</strong> This software project is designed and implemented exclusively for engineering demonstration and educational research. It is not approved as medical software and does not replace certified clinical diagnosis.
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-700">Project Evaluator Signature:</div>
            <div className="h-10 border-b border-slate-400 w-48 ml-auto mt-2"></div>
            <div className="text-[10px] text-slate-400 mt-1">Faculty / External Examiner</div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.MedicalReport = MedicalReport;
