// Disease Prediction Machine Learning Component (Diabetes & Heart Disease)
const Prediction = ({ prefilledPatient }) => {
  const [diseaseType, setDiseaseType] = React.useState('diabetes'); // 'diabetes' or 'heart'
  const [modelType, setModelType] = React.useState('random_forest'); // 'random_forest', 'logistic_regression', 'decision_tree'
  const [metrics, setMetrics] = React.useState(null);
  const [loadingMetrics, setLoadingMetrics] = React.useState(false);

  // Diabetes Form Inputs
  const [diabetesForm, setDiabetesForm] = React.useState({
    age: 48,
    bmi: 28.5,
    glucose: 125,
    blood_pressure: 82,
    insulin: 110,
    physical_activity: 1, // 0=Sedentary, 1=Moderate, 2=Active
    family_history: 1
  });

  // Heart Form Inputs
  const [heartForm, setHeartForm] = React.useState({
    age: 56,
    gender: 'Male',
    systolic_bp: 142,
    cholesterol: 235,
    heart_rate: 78,
    bmi: 29.2,
    smoking_status: 1, // 0=Never, 1=Former, 2=Current
    physical_activity: 1,
    exercise_angina: 0
  });

  const [predicting, setPredicting] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [history, setHistory] = React.useState([]);

  // Check if a patient was transferred from the Patient modal
  React.useEffect(() => {
    if (prefilledPatient) {
      setDiabetesForm({
        age: prefilledPatient.age || 48,
        bmi: prefilledPatient.bmi || 27.5,
        glucose: prefilledPatient.glucose_level || 110,
        blood_pressure: prefilledPatient.diastolic_bp || 80,
        insulin: 95,
        physical_activity: prefilledPatient.physical_activity === 'Active' ? 2 : prefilledPatient.physical_activity === 'Sedentary' ? 0 : 1,
        family_history: prefilledPatient.medical_history?.includes('Diabetes') ? 1 : 0
      });

      setHeartForm({
        age: prefilledPatient.age || 52,
        gender: prefilledPatient.gender || 'Male',
        systolic_bp: prefilledPatient.systolic_bp || 130,
        cholesterol: prefilledPatient.cholesterol || 195,
        heart_rate: prefilledPatient.heart_rate || 75,
        bmi: prefilledPatient.bmi || 27.5,
        smoking_status: prefilledPatient.smoking_status === 'Current' ? 2 : prefilledPatient.smoking_status === 'Former' ? 1 : 0,
        physical_activity: prefilledPatient.physical_activity === 'Active' ? 2 : prefilledPatient.physical_activity === 'Sedentary' ? 0 : 1,
        exercise_angina: 0
      });
    }
  }, [prefilledPatient]);

  // Load Model Metrics when diseaseType changes
  React.useEffect(() => {
    loadMetrics(diseaseType);
    loadHistory();
  }, [diseaseType]);

  const loadMetrics = async (type) => {
    setLoadingMetrics(true);
    try {
      const res = await window.api.getModelMetrics(type);
      if (res.success) {
        setMetrics(res.metrics);
      }
    } catch (e) {
      console.error("Failed to load metrics", e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await window.api.getPredictionHistory();
      if (res.success) {
        setHistory(res.history || []);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setResult(null);

    try {
      let res;
      if (diseaseType === 'diabetes') {
        res = await window.api.predictDiabetes({
          ...diabetesForm,
          model: modelType,
          patient_id: prefilledPatient ? prefilledPatient.patient_id : null
        });
      } else {
        res = await window.api.predictHeart({
          ...heartForm,
          model: modelType,
          patient_id: prefilledPatient ? prefilledPatient.patient_id : null
        });
      }

      if (res.success) {
        setResult(res.result);
        loadHistory();
      } else {
        alert("Prediction error: " + res.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setPredicting(false);
    }
  };

  // Sample Presets for Demonstration
  const loadPreset = (presetName) => {
    if (diseaseType === 'diabetes') {
      if (presetName === 'healthy') {
        setDiabetesForm({ age: 28, bmi: 22.0, glucose: 88, blood_pressure: 72, insulin: 60, physical_activity: 2, family_history: 0 });
      } else if (presetName === 'moderate') {
        setDiabetesForm({ age: 48, bmi: 28.5, glucose: 118, blood_pressure: 82, insulin: 120, physical_activity: 1, family_history: 1 });
      } else if (presetName === 'high') {
        setDiabetesForm({ age: 62, bmi: 34.2, glucose: 175, blood_pressure: 92, insulin: 210, physical_activity: 0, family_history: 1 });
      }
    } else {
      if (presetName === 'healthy') {
        setHeartForm({ age: 30, gender: 'Female', systolic_bp: 115, cholesterol: 165, heart_rate: 68, bmi: 21.5, smoking_status: 0, physical_activity: 2, exercise_angina: 0 });
      } else if (presetName === 'moderate') {
        setHeartForm({ age: 52, gender: 'Male', systolic_bp: 138, cholesterol: 215, heart_rate: 76, bmi: 28.0, smoking_status: 1, physical_activity: 1, exercise_angina: 0 });
      } else if (presetName === 'high') {
        setHeartForm({ age: 66, gender: 'Male', systolic_bp: 162, cholesterol: 275, heart_rate: 88, bmi: 32.5, smoking_status: 2, physical_activity: 0, exercise_angina: 1 });
      }
    }
  };

  const currentModelMetrics = metrics ? metrics[modelType] : null;

  return (
    <div className="space-y-6 fade-in">
      {/* Disease Target Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setDiseaseType('diabetes'); setResult(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              diseaseType === 'diabetes'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <i className="fa-solid fa-droplet text-amber-300"></i>
            <span>Type 2 Diabetes Risk Prediction</span>
          </button>

          <button
            onClick={() => { setDiseaseType('heart'); setResult(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              diseaseType === 'heart'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <i className="fa-solid fa-heart-pulse text-rose-300"></i>
            <span>Cardiovascular Disease Risk Prediction</span>
          </button>
        </div>

        {prefilledPatient && (
          <div className="text-xs bg-sky-50 border border-sky-100 text-sky-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <i className="fa-solid fa-user-check text-sky-600"></i>
            <span>Testing Patient: <strong>{prefilledPatient.full_name} ({prefilledPatient.patient_id})</strong></span>
          </div>
        )}
      </div>

      {/* Model Benchmark Card */}
      <div className="medical-card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-microchip text-teal-600"></i>
              <span>Scikit-Learn Machine Learning Model Suite</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated on 20% stratified held-out test data (No data leakage)
            </p>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Active Model:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'random_forest', label: 'Random Forest' },
                { id: 'logistic_regression', label: 'Logistic Reg' },
                { id: 'decision_tree', label: 'Decision Tree' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setModelType(m.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    modelType === m.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        {loadingMetrics ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading model performance benchmarks...</div>
        ) : currentModelMetrics ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Test Accuracy</span>
              <div className="text-xl font-black text-sky-700 mt-1">{currentModelMetrics.accuracy}%</div>
              <span className="text-[10px] text-slate-400">Held-out test set</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Precision</span>
              <div className="text-xl font-black text-teal-700 mt-1">{currentModelMetrics.precision}%</div>
              <span className="text-[10px] text-slate-400">Positive predictive</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Recall / Sensitivity</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{currentModelMetrics.recall}%</div>
              <span className="text-[10px] text-slate-400">True positive rate</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">F1-Score</span>
              <div className="text-xl font-black text-amber-700 mt-1">{currentModelMetrics.f1_score}%</div>
              <span className="text-[10px] text-slate-400">Harmonic balance</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">ROC-AUC Score</span>
              <div className="text-xl font-black text-purple-700 mt-1">{currentModelMetrics.roc_auc}</div>
              <span className="text-[10px] text-slate-400">Area under curve</span>
            </div>
          </div>
        ) : null}

        {/* Confusion Matrix Visual Grid */}
        {currentModelMetrics && currentModelMetrics.confusion_matrix && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              <strong className="text-slate-800">Test Set Confusion Matrix:</strong>
              <div className="inline-flex items-center gap-3 ml-3 font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  True Negative: {currentModelMetrics.confusion_matrix[0][0]}
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  False Positive: {currentModelMetrics.confusion_matrix[0][1]}
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  False Negative: {currentModelMetrics.confusion_matrix[1][0]}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  True Positive: {currentModelMetrics.confusion_matrix[1][1]}
                </span>
              </div>
            </div>

            {/* Quick Demo Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
              <button
                type="button"
                onClick={() => loadPreset('healthy')}
                className="px-2 py-1 text-[11px] rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium"
              >
                Healthy
              </button>
              <button
                type="button"
                onClick={() => loadPreset('moderate')}
                className="px-2 py-1 text-[11px] rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium"
              >
                Moderate
              </button>
              <button
                type="button"
                onClick={() => loadPreset('high')}
                className="px-2 py-1 text-[11px] rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium"
              >
                High Risk
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form and Result Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 medical-card p-6">
          <h3 className="font-bold text-slate-800 text-sm mb-1">
            {diseaseType === 'diabetes' ? 'Enter Glycemic & Metabolic Biomarkers' : 'Enter Cardiovascular & Hemodynamic Vitals'}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Inputs are scaled using the trained StandardScaler before classification
          </p>

          <form onSubmit={handlePredict} className="space-y-4">
            {diseaseType === 'diabetes' ? (
              /* DIABETES INPUTS */
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Patient Age (Years)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 focus:outline-sky-500"
                      value={diabetesForm.age}
                      onChange={e => setDiabetesForm(f => ({ ...f, age: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Body Mass Index (BMI)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min="10"
                      max="60"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 focus:outline-sky-500"
                      value={diabetesForm.bmi}
                      onChange={e => setDiabetesForm(f => ({ ...f, bmi: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Fasting Glucose Level (mg/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min="40"
                      max="350"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 focus:outline-sky-500"
                      value={diabetesForm.glucose}
                      onChange={e => setDiabetesForm(f => ({ ...f, glucose: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Diastolic Blood Pressure (mmHg)</label>
                    <input
                      type="number"
                      required
                      min="40"
                      max="150"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 focus:outline-sky-500"
                      value={diabetesForm.blood_pressure}
                      onChange={e => setDiabetesForm(f => ({ ...f, blood_pressure: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Serum Insulin (μU/mL)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="800"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 focus:outline-sky-500"
                      value={diabetesForm.insulin}
                      onChange={e => setDiabetesForm(f => ({ ...f, insulin: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Physical Activity</label>
                    <select
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 bg-white focus:outline-sky-500"
                      value={diabetesForm.physical_activity}
                      onChange={e => setDiabetesForm(f => ({ ...f, physical_activity: parseInt(e.target.value) }))}
                    >
                      <option value="0">Sedentary (0)</option>
                      <option value="1">Moderate (1)</option>
                      <option value="2">Active (2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Family History</label>
                    <select
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 bg-white focus:outline-sky-500"
                      value={diabetesForm.family_history}
                      onChange={e => setDiabetesForm(f => ({ ...f, family_history: parseInt(e.target.value) }))}
                    >
                      <option value="0">No Family History</option>
                      <option value="1">Family History Present</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              /* HEART INPUTS */
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Age</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 focus:outline-sky-500"
                      value={heartForm.age}
                      onChange={e => setHeartForm(f => ({ ...f, age: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Gender</label>
                    <select
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 bg-white focus:outline-sky-500"
                      value={heartForm.gender}
                      onChange={e => setHeartForm(f => ({ ...f, gender: e.target.value }))}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">BMI</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 focus:outline-sky-500"
                      value={heartForm.bmi}
                      onChange={e => setHeartForm(f => ({ ...f, bmi: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Systolic Blood Pressure (mmHg)</label>
                    <input
                      type="number"
                      required
                      min="70"
                      max="240"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 focus:outline-sky-500"
                      value={heartForm.systolic_bp}
                      onChange={e => setHeartForm(f => ({ ...f, systolic_bp: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Total Serum Cholesterol (mg/dL)</label>
                    <input
                      type="number"
                      required
                      min="100"
                      max="500"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 focus:outline-sky-500"
                      value={heartForm.cholesterol}
                      onChange={e => setHeartForm(f => ({ ...f, cholesterol: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      required
                      min="40"
                      max="220"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 focus:outline-sky-500"
                      value={heartForm.heart_rate}
                      onChange={e => setHeartForm(f => ({ ...f, heart_rate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Smoking Status</label>
                    <select
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 bg-white focus:outline-sky-500"
                      value={heartForm.smoking_status}
                      onChange={e => setHeartForm(f => ({ ...f, smoking_status: parseInt(e.target.value) }))}
                    >
                      <option value="0">Never Smoked</option>
                      <option value="1">Former Smoker</option>
                      <option value="2">Current Smoker</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Exercise Angina</label>
                    <select
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 mt-1 bg-white focus:outline-sky-500"
                      value={heartForm.exercise_angina}
                      onChange={e => setHeartForm(f => ({ ...f, exercise_angina: parseInt(e.target.value) }))}
                    >
                      <option value="0">No Angina</option>
                      <option value="1">Angina Present</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={predicting}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {predicting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Running Machine Learning Pipeline...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    <span>Evaluate Disease Risk ({modelType.replace('_', ' ').toUpperCase()})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Results Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="medical-card p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800 text-sm">Algorithmic Risk Assessment</h4>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {diseaseType === 'diabetes' ? 'Type 2 Diabetes' : 'Cardiovascular'}
                </span>
              </div>

              {!result ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl mb-3">
                    <i className="fa-solid fa-shield-virus"></i>
                  </div>
                  <p className="text-xs font-medium max-w-xs">
                    Fill the clinical parameters and click "Evaluate Disease Risk" to generate probability estimates.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 fade-in">
                  {/* Risk Gauge Header */}
                  <div className={`p-4 rounded-xl border text-center ${
                    result.risk_category === 'Low Risk'
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : result.risk_category === 'Moderate Risk'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-rose-50/70 border-rose-200'
                  }`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Estimated Risk Tier
                    </span>
                    <div className={`text-2xl font-black mt-0.5 ${
                      result.risk_category === 'Low Risk'
                        ? 'text-emerald-700'
                        : result.risk_category === 'Moderate Risk'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}>
                      {result.risk_category}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full transition-all duration-700 ${
                          result.risk_category === 'Low Risk'
                            ? 'bg-emerald-500'
                            : result.risk_category === 'Moderate Risk'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${result.risk_score}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-1">
                      <span>Low Risk (0%)</span>
                      <span>Probability: {result.risk_score}%</span>
                      <span>High Risk (100%)</span>
                    </div>
                  </div>

                  {/* Model Used */}
                  <div className="text-xs text-slate-500 flex items-center justify-between px-1">
                    <span>Classifier Architecture:</span>
                    <strong className="text-slate-800">{result.model_used}</strong>
                  </div>

                  {/* Contributing Factors */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 mb-2">Key Contributing Factors:</h5>
                    <div className="space-y-1.5">
                      {result.contributing_factors.map((f, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start gap-2">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            f.impact === 'High' ? 'bg-rose-500' : f.impact === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {f.factor} <span className="text-slate-400 font-normal">({f.value})</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{f.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mandatory Academic Disclaimer */}
            <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-0.5 shrink-0"></i>
              <div>
                <strong>Academic / Research Disclaimer:</strong> This machine learning prediction system is developed strictly for college demonstration and educational simulation. It does not replace clinical testing or professional medical advice.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Prediction Logs */}
      {history.length > 0 && (
        <div className="medical-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-800 text-sm">Prediction Audit Log</h4>
            <span className="text-xs font-semibold text-slate-400">Stored in database</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Assessment Type</th>
                  <th className="py-2 px-3">Model</th>
                  <th className="py-2 px-3">Risk Score</th>
                  <th className="py-2 px-3">Risk Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 5).map(h => (
                  <tr key={h.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 text-slate-400">{h.created_at}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{h.prediction_type}</td>
                    <td className="py-2 px-3 text-slate-600">{h.model_used}</td>
                    <td className="py-2 px-3 font-bold text-sky-700">{h.risk_score}%</td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        h.risk_category === 'Low Risk' ? 'badge-low' : h.risk_category === 'Moderate Risk' ? 'badge-moderate' : 'badge-high'
                      }`}>
                        {h.risk_category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

window.Prediction = Prediction;
