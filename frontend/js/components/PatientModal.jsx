// Patient Modal Component (Add, Edit, and View Detailed Dossier)
const PatientModal = ({ isOpen, mode, patient, onClose, onSave, onTransferToML }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = React.useState({
    patient_id: '',
    full_name: '',
    age: 45,
    gender: 'Male',
    height: 172,
    weight: 74,
    blood_group: 'O+',
    systolic_bp: 120,
    diastolic_bp: 80,
    heart_rate: 72,
    body_temperature: 36.7,
    glucose_level: 100,
    cholesterol: 185,
    smoking_status: 'Never',
    physical_activity: 'Moderate',
    medical_history: 'None'
  });

  const [newRecord, setNewRecord] = React.useState({
    record_type: 'Follow-up Consultation',
    diagnosis: '',
    doctor_name: 'Dr. Sarah Jenkins, MD',
    treatment_plan: '',
    notes: ''
  });

  const [recordsList, setRecordsList] = React.useState([]);
  const [loadingRecords, setLoadingRecords] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (patient) {
      setFormData({
        patient_id: patient.patient_id || '',
        full_name: patient.full_name || '',
        age: patient.age || 45,
        gender: patient.gender || 'Male',
        height: patient.height || 170,
        weight: patient.weight || 70,
        blood_group: patient.blood_group || 'O+',
        systolic_bp: patient.systolic_bp || 120,
        diastolic_bp: patient.diastolic_bp || 80,
        heart_rate: patient.heart_rate || 72,
        body_temperature: patient.body_temperature || 36.7,
        glucose_level: patient.glucose_level || 100,
        cholesterol: patient.cholesterol || 185,
        smoking_status: patient.smoking_status || 'Never',
        physical_activity: patient.physical_activity || 'Moderate',
        medical_history: patient.medical_history || 'None'
      });

      if (mode === 'view' && patient.patient_id) {
        setLoadingRecords(true);
        window.api.getPatient(patient.patient_id).then(res => {
          if (res.success && res.medical_records) {
            setRecordsList(res.medical_records);
          }
          setLoadingRecords(false);
        }).catch(() => setLoadingRecords(false));
      }
    } else {
      setFormData({
        patient_id: '',
        full_name: '',
        age: 35,
        gender: 'Male',
        height: 172,
        weight: 72,
        blood_group: 'O+',
        systolic_bp: 120,
        diastolic_bp: 80,
        heart_rate: 72,
        body_temperature: 36.7,
        glucose_level: 95,
        cholesterol: 180,
        smoking_status: 'Never',
        physical_activity: 'Moderate',
        medical_history: 'None'
      });
      setRecordsList([]);
    }
  }, [patient, mode]);

  // Compute live BMI & Category
  const calculatedBMI = React.useMemo(() => {
    const h = parseFloat(formData.height) / 100;
    const w = parseFloat(formData.weight);
    if (!h || !w || h <= 0) return { bmi: 0, cat: 'Normal', color: 'text-slate-500' };
    const val = (w / (h * h)).toFixed(1);
    let cat = 'Normal';
    let color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val < 18.5) {
      cat = 'Underweight';
      color = 'text-blue-600 bg-blue-50 border-blue-200';
    } else if (val < 25.0) {
      cat = 'Normal Weight';
      color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    } else if (val < 30.0) {
      cat = 'Overweight';
      color = 'text-amber-600 bg-amber-50 border-amber-200';
    } else {
      cat = 'Obese';
      color = 'text-rose-600 bg-rose-50 border-rose-200';
    }
    return { bmi: val, cat, color };
  }, [formData.height, formData.weight]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSave(formData, mode);
    setSubmitting(false);
  };

  const handleAddDoctorNote = async (e) => {
    e.preventDefault();
    if (!newRecord.diagnosis) return;
    try {
      const res = await window.api.addMedicalRecord(patient.patient_id, newRecord);
      if (res.success) {
        setRecordsList(prev => [
          { ...newRecord, record_date: new Date().toISOString().split('T')[0] },
          ...prev
        ]);
        setNewRecord({
          record_type: 'Follow-up Consultation',
          diagnosis: '',
          doctor_name: 'Dr. Sarah Jenkins, MD',
          treatment_plan: '',
          notes: ''
        });
      }
    } catch (err) {
      alert('Error saving record: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden fade-in my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
              <i className={`fa-solid ${mode === 'view' ? 'fa-id-card-clip' : mode === 'edit' ? 'fa-user-pen' : 'fa-user-plus'}`}></i>
            </div>
            <div>
              <h3 className="font-bold text-base">
                {mode === 'view' ? `Patient Clinical Dossier: ${formData.full_name || formData.patient_id}` : mode === 'edit' ? `Edit Patient Record: ${formData.patient_id}` : 'Register New Patient'}
              </h3>
              <p className="text-xs text-sky-200">
                {mode === 'view' ? `ID: ${formData.patient_id} • Registered ${patient?.registration_date || 'Recent'}` : 'Complete patient biometric profile and clinical parameters'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {mode === 'view' ? (
            /* VIEW MODE: Clinical Profile */
            <div className="space-y-6">
              {/* Profile Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                    {formData.full_name.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{formData.full_name}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {formData.age} years old • {formData.gender} • Blood Group: <strong className="text-slate-700">{formData.blood_group}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTransferToML(patient)}
                    className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow hover:from-sky-700 hover:to-teal-700 flex items-center gap-1.5 transition-all"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    <span>Transfer to ML Prediction</span>
                  </button>
                </div>
              </div>

              {/* Vitals Summary Grid */}
              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current Clinical Vitals</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Blood Pressure</span>
                    <div className="text-lg font-bold text-slate-800 mt-1">{formData.systolic_bp} / {formData.diastolic_bp} <span className="text-xs text-slate-400">mmHg</span></div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${formData.systolic_bp >= 130 ? 'badge-high' : 'badge-low'}`}>
                      {formData.systolic_bp >= 140 ? 'Stage 2 HTN' : formData.systolic_bp >= 130 ? 'Pre-HTN' : 'Normal'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Fasting Glucose</span>
                    <div className="text-lg font-bold text-slate-800 mt-1">{formData.glucose_level} <span className="text-xs text-slate-400">mg/dL</span></div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${formData.glucose_level >= 126 ? 'badge-high' : formData.glucose_level >= 100 ? 'badge-moderate' : 'badge-low'}`}>
                      {formData.glucose_level >= 126 ? 'Diabetic Range' : formData.glucose_level >= 100 ? 'Impaired' : 'Normal'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Heart Rate</span>
                    <div className="text-lg font-bold text-slate-800 mt-1">{formData.heart_rate} <span className="text-xs text-slate-400">bpm</span></div>
                    <span className="text-[10px] text-slate-500">Resting Pulse</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Cholesterol</span>
                    <div className="text-lg font-bold text-slate-800 mt-1">{formData.cholesterol} <span className="text-xs text-slate-400">mg/dL</span></div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${formData.cholesterol >= 200 ? 'badge-moderate' : 'badge-low'}`}>
                      {formData.cholesterol >= 240 ? 'High' : formData.cholesterol >= 200 ? 'Borderline' : 'Desirable'}
                    </span>
                  </div>
                </div>
              </div>

              {/* BMI Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Body Mass Index (BMI Formula: Weight / Height²)</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xl font-black text-slate-800">{calculatedBMI.bmi}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${calculatedBMI.color}`}>
                      {calculatedBMI.cat}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Height: {formData.height} cm • Weight: {formData.weight} kg
                  </p>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>Smoking: <strong className="text-slate-800">{formData.smoking_status}</strong></div>
                  <div>Physical Activity: <strong className="text-slate-800">{formData.physical_activity}</strong></div>
                  <div>Medical History: <strong className="text-slate-800">{formData.medical_history}</strong></div>
                </div>
              </div>

              {/* Consultation Records Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Consultations & Progress Notes</h5>
                  <span className="text-xs font-semibold text-slate-400">{recordsList.length} Records</span>
                </div>

                {loadingRecords ? (
                  <div className="text-center py-4 text-xs text-slate-400">Loading consultation records...</div>
                ) : recordsList.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-xl border-slate-200 text-xs text-slate-400">
                    No doctor consultation notes yet. Use the form below to record a consultation.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recordsList.map((rec, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-sky-800">{rec.record_type}</span>
                          <span className="text-slate-400 font-medium">{rec.record_date}</span>
                        </div>
                        <div className="text-xs text-slate-700 font-medium">{rec.diagnosis}</div>
                        {rec.treatment_plan && (
                          <div className="text-[11px] text-teal-700 bg-teal-50/70 p-2 rounded-lg border border-teal-100">
                            <strong>Plan:</strong> {rec.treatment_plan}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 italic">Signed: {rec.doctor_name}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Doctor Note Form */}
                <form onSubmit={handleAddDoctorNote} className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <i className="fa-solid fa-notes-medical text-teal-600"></i>
                    <span>Record New Clinical Consultation</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500">Record Type</label>
                      <input
                        type="text"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200"
                        value={newRecord.record_type}
                        onChange={e => setNewRecord(r => ({ ...r, record_type: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500">Physician Name</label>
                      <input
                        type="text"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200"
                        value={newRecord.doctor_name}
                        onChange={e => setNewRecord(r => ({ ...r, doctor_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Clinical Assessment / Diagnosis</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2 rounded-lg border border-slate-200"
                      placeholder="e.g. Stage 1 Hypertension. Prescribed lifestyle modification."
                      value={newRecord.diagnosis}
                      onChange={e => setNewRecord(r => ({ ...r, diagnosis: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Treatment Plan</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2 rounded-lg border border-slate-200"
                      placeholder="e.g. Sodium restriction, follow up in 3 months."
                      value={newRecord.treatment_plan}
                      onChange={e => setNewRecord(r => ({ ...r, treatment_plan: e.target.value }))}
                    />
                  </div>
                  <div className="text-right">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 shadow-sm"
                    >
                      Save Consultation Note
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* ADD / EDIT FORM */
            <form id="patientForm" onSubmit={handleSubmit} className="space-y-4">
              {/* Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Alexander Morgan"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Age (Years) *</label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="120"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Gender *</label>
                  <select
                    name="gender"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1 bg-white"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Blood Group</label>
                  <select
                    name="blood_group"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1 bg-white"
                    value={formData.blood_group}
                    onChange={handleChange}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Height (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    name="height"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1"
                    value={formData.height}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Automatic BMI Calculation Display */}
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-calculator text-sky-600"></i>
                  <span className="text-xs font-semibold text-sky-900">Calculated Body Mass Index (BMI):</span>
                  <span className="text-sm font-black text-sky-700">{calculatedBMI.bmi} kg/m²</span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${calculatedBMI.color}`}>
                  {calculatedBMI.cat}
                </span>
              </div>

              {/* Biometric Vitals */}
              <div className="border-t border-slate-100 pt-3">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Biometrics & Clinical Vitals</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      name="systolic_bp"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1"
                      value={formData.systolic_bp}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      name="diastolic_bp"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1"
                      value={formData.diastolic_bp}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Glucose (mg/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="glucose_level"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1"
                      value={formData.glucose_level}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      name="heart_rate"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1"
                      value={formData.heart_rate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Cholesterol (mg/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="cholesterol"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1"
                      value={formData.cholesterol}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Body Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="body_temperature"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1"
                      value={formData.body_temperature}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Smoking Status</label>
                    <select
                      name="smoking_status"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1 bg-white"
                      value={formData.smoking_status}
                      onChange={handleChange}
                    >
                      <option value="Never">Never</option>
                      <option value="Former">Former</option>
                      <option value="Current">Current</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lifestyle & Medical History */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Physical Activity Level</label>
                  <select
                    name="physical_activity"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1 bg-white"
                    value={formData.physical_activity}
                    onChange={handleChange}
                  >
                    <option value="Sedentary">Sedentary</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Medical History / Chronic Conditions</label>
                  <input
                    type="text"
                    name="medical_history"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-sky-500 mt-1"
                    placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                    value={formData.medical_history}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-all"
          >
            {mode === 'view' ? 'Close Dossier' : 'Cancel'}
          </button>
          {mode !== 'view' && (
            <button
              type="submit"
              form="patientForm"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i>
                  <span>{mode === 'edit' ? 'Update Patient' : 'Save Patient Record'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

window.PatientModal = PatientModal;
