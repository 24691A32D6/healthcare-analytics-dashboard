// Main Application Root Component
const App = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [dashboardData, setDashboardData] = React.useState(null);
  const [systemInfo, setSystemInfo] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  // Modal State
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    mode: 'add',
    patient: null
  });

  // Prefilled Patient for ML Prediction tab
  const [prefilledPatient, setPrefilledPatient] = React.useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadHealthAndDashboard = React.useCallback(async () => {
    try {
      const [healthRes, dashRes] = await Promise.all([
        window.api.getHealth(),
        window.api.getDashboard()
      ]);
      setSystemInfo(healthRes);
      if (dashRes.success) {
        setDashboardData(dashRes.data);
      }
    } catch (e) {
      console.error("Error loading dashboard data", e);
    }
  }, []);

  React.useEffect(() => {
    loadHealthAndDashboard();
  }, [loadHealthAndDashboard]);

  // Modal Handlers
  const handleOpenAdd = () => {
    setModalState({ isOpen: true, mode: 'add', patient: null });
  };

  const handleOpenEdit = (patient) => {
    setModalState({ isOpen: true, mode: 'edit', patient });
  };

  const handleOpenView = (patient) => {
    setModalState({ isOpen: true, mode: 'view', patient });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: 'add', patient: null });
  };

  const handleSavePatient = async (formData, mode) => {
    try {
      let res;
      if (mode === 'edit') {
        res = await window.api.updatePatient(formData.patient_id, formData);
      } else {
        res = await window.api.createPatient(formData);
      }

      if (res.success) {
        showToast(mode === 'edit' ? 'Patient updated successfully' : 'New patient registered successfully', 'success');
        handleCloseModal();
        loadHealthAndDashboard();
      } else {
        alert("Operation failed: " + res.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Transfer patient vitals to ML prediction tab
  const handleTransferToML = (patient) => {
    setPrefilledPatient(patient);
    handleCloseModal();
    setActiveTab('prediction');
    showToast(`Vitals for ${patient.full_name} transferred to Machine Learning Predictor`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 fade-in">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-rose-600 text-white border-rose-700'
          }`}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemInfo={systemInfo}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar
          activeTab={activeTab}
          onOpenAddPatient={handleOpenAdd}
          systemInfo={systemInfo}
        />

        <main className="p-8 mt-16 flex-1">
          {activeTab === 'dashboard' && (
            <Dashboard
              dashboardData={dashboardData}
              onOpenAddPatient={handleOpenAdd}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'patients' && (
            <Patients
              onOpenAdd={handleOpenAdd}
              onOpenEdit={handleOpenEdit}
              onOpenView={handleOpenView}
              onRefreshDashboard={loadHealthAndDashboard}
              onTransferToML={handleTransferToML}
            />
          )}

          {activeTab === 'analytics' && <Analytics />}

          {activeTab === 'prediction' && (
            <Prediction prefilledPatient={prefilledPatient} />
          )}

          {activeTab === 'datasets' && <Datasets />}

          {activeTab === 'report' && (
            <MedicalReport
              dashboardData={dashboardData}
              systemInfo={systemInfo}
            />
          )}
        </main>
      </div>

      {/* Patient Add/Edit/View Modal */}
      <PatientModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        patient={modalState.patient}
        onClose={handleCloseModal}
        onSave={handleSavePatient}
        onTransferToML={handleTransferToML}
      />
    </div>
  );
};

// Render React Root
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
