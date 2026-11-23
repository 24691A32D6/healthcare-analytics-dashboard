// Patients Management Component with Search, Multi-Filter, Sorting, and Pagination
const Patients = ({ onOpenAdd, onOpenEdit, onOpenView, onRefreshDashboard, onTransferToML }) => {
  const [patients, setPatients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState({
    gender: '',
    diabetes_risk: '',
    heart_risk: '',
    bmi_category: '',
    sort_by: 'id',
    order: 'DESC'
  });
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 12;

  const loadPatients = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await window.api.getPatients({
        q: search,
        gender: filters.gender,
        diabetes_risk: filters.diabetes_risk,
        heart_risk: filters.heart_risk,
        bmi_category: filters.bmi_category,
        sort_by: filters.sort_by,
        order: filters.order
      });
      if (res.success) {
        setPatients(res.patients || []);
      }
    } catch (e) {
      console.error("Failed to load patients", e);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadPatients]);

  const handleDelete = async (patientId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete patient ${name} (${patientId})? This will also remove associated medical records.`)) {
      return;
    }
    try {
      const res = await window.api.deletePatient(patientId);
      if (res.success) {
        loadPatients();
        onRefreshDashboard();
      } else {
        alert("Failed to delete: " + res.error);
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleExportCSV = () => {
    if (!patients.length) return;
    const headers = Object.keys(patients[0]).join(',');
    const rows = patients.map(p => Object.values(p).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `medipulse_patients_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination slice
  const totalPages = Math.ceil(patients.length / itemsPerPage) || 1;
  const paginatedPatients = patients.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-5 fade-in">
      {/* Top Filter and Action Bar */}
      <div className="medical-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs"></i>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-sky-500 bg-slate-50/50"
            placeholder="Search by ID, name, diagnosis..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700"
            value={filters.gender}
            onChange={e => { setFilters(f => ({ ...f, gender: e.target.value })); setPage(1); }}
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700"
            value={filters.diabetes_risk}
            onChange={e => { setFilters(f => ({ ...f, diabetes_risk: e.target.value })); setPage(1); }}
          >
            <option value="">Diabetes Risk: All</option>
            <option value="Low">Low Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="High">High Risk</option>
          </select>

          <select
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700"
            value={filters.heart_risk}
            onChange={e => { setFilters(f => ({ ...f, heart_risk: e.target.value })); setPage(1); }}
          >
            <option value="">Heart Risk: All</option>
            <option value="Low">Low Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="High">High Risk</option>
          </select>

          <select
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700"
            value={filters.sort_by}
            onChange={e => setFilters(f => ({ ...f, sort_by: e.target.value }))}
          >
            <option value="id">Sort: Default (ID)</option>
            <option value="full_name">Sort: Name</option>
            <option value="age">Sort: Age</option>
            <option value="bmi">Sort: BMI</option>
            <option value="glucose_level">Sort: Glucose</option>
            <option value="systolic_bp">Sort: Blood Pressure</option>
          </select>

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            title="Export filtered records to CSV"
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <i className="fa-solid fa-file-arrow-down text-teal-600"></i>
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Add Patient */}
          <button
            onClick={onOpenAdd}
            className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
          >
            <i className="fa-solid fa-user-plus"></i>
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="medical-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">BMI & Category</th>
                <th className="py-3 px-4">Blood Pressure</th>
                <th className="py-3 px-4">Glucose</th>
                <th className="py-3 px-4">Risk Tiers</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <i className="fa-solid fa-circle-notch fa-spin text-2xl text-sky-600 mb-2"></i>
                    <p>Loading patient records...</p>
                  </td>
                </tr>
              ) : paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <i className="fa-solid fa-folder-open text-3xl mb-2 text-slate-300"></i>
                    <p className="font-medium">No patient records match the selected criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedPatients.map(p => (
                  <tr key={p.patient_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID */}
                    <td className="py-3 px-4 font-bold text-sky-700 whitespace-nowrap">
                      {p.patient_id}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.full_name}</div>
                      <div className="text-[11px] text-slate-400">Reg: {p.registration_date}</div>
                    </td>

                    {/* Age / Gender / Blood Group */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-700">{p.age} yrs • {p.gender}</div>
                      <div className="text-[11px] text-slate-400">Blood: <strong className="text-slate-600">{p.blood_group}</strong></div>
                    </td>

                    {/* BMI */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{p.bmi} kg/m²</div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        p.bmi_category === 'Normal' ? 'badge-low' : p.bmi_category === 'Overweight' ? 'badge-moderate' : 'badge-high'
                      }`}>
                        {p.bmi_category}
                      </span>
                    </td>

                    {/* BP */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{p.systolic_bp} / {p.diastolic_bp}</div>
                      <div className="text-[11px] text-slate-400">HR: {p.heart_rate} bpm</div>
                    </td>

                    {/* Glucose */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{p.glucose_level} mg/dL</div>
                      <div className="text-[11px] text-slate-400">Chol: {p.cholesterol}</div>
                    </td>

                    {/* Risk Tiers */}
                    <td className="py-3 px-4 whitespace-nowrap space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-slate-400 w-12">Diabetes:</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.diabetes_risk === 'Low' ? 'badge-low' : p.diabetes_risk === 'Moderate' ? 'badge-moderate' : 'badge-high'
                        }`}>
                          {p.diabetes_risk}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-slate-400 w-12">Heart:</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.heart_risk === 'Low' ? 'badge-low' : p.heart_risk === 'Moderate' ? 'badge-moderate' : 'badge-high'
                        }`}>
                          {p.heart_risk}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenView(p)}
                          title="View clinical dossier"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          onClick={() => onOpenEdit(p)}
                          title="Edit patient"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => onTransferToML(p)}
                          title="Run ML Disease Risk Predictor for this patient"
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(p.patient_id, p.full_name)}
                          title="Delete patient"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{Math.min(patients.length, (page - 1) * itemsPerPage + 1)}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(patients.length, page * itemsPerPage)}</strong> of{' '}
            <strong className="text-slate-800">{patients.length}</strong> patients
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 font-medium"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-700">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Patients = Patients;
