// Top Navigation Bar Component
const Navbar = ({ activeTab, onOpenAddPatient, systemInfo }) => {
  const titles = {
    dashboard: { title: 'Executive Healthcare Dashboard', sub: 'Population health vitals, demographic analytics & disease risk patterns' },
    patients: { title: 'Patient Directory & Clinical Records', sub: 'Comprehensive record management, vitals monitoring & BMI categorization' },
    analytics: { title: 'Healthcare Data Analytics & EDA', sub: 'Statistical profiling, outlier detection, correlation matrix & visualizer' },
    prediction: { title: 'Disease Risk Prediction (ML)', sub: 'Machine learning estimation for Diabetes and Heart Disease with Scikit-learn' },
    datasets: { title: 'Dataset Profiling & Management', sub: 'Upload CSV datasets, column schema inspection, and data distributions' },
    report: { title: 'Formal Clinical Health Report', sub: 'Comprehensive printable evaluation report for healthcare demonstration' }
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-64 z-20 px-8 flex items-center justify-between no-print">
      <div>
        <h2 className="font-bold text-slate-800 text-base">{current.title}</h2>
        <p className="text-xs text-slate-500 font-normal">{current.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-sky-800 text-xs font-medium">
          <i className="fa-solid fa-graduation-cap text-sky-600"></i>
          <span>Academic Demo</span>
        </div>

        {/* Database Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>DB: {systemInfo?.database_engine === 'mysql' ? 'MySQL 8.0' : 'SQLite 3'}</span>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={onOpenAddPatient}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shadow-sky-200"
        >
          <i className="fa-solid fa-user-plus"></i>
          <span>New Patient</span>
        </button>
      </div>
    </header>
  );
};

window.Navbar = Navbar;
