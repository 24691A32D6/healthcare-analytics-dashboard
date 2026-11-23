// Sidebar Navigation Component
const Sidebar = ({ activeTab, setActiveTab, systemInfo }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: 'fa-chart-pie', badge: '10 Charts' },
    { id: 'patients', label: 'Patient Management', icon: 'fa-users', badge: null },
    { id: 'analytics', label: 'Healthcare Analytics', icon: 'fa-chart-line', badge: 'EDA' },
    { id: 'prediction', label: 'Disease Prediction ML', icon: 'fa-heart-pulse', badge: 'AI Models' },
    { id: 'datasets', label: 'Dataset Management', icon: 'fa-database', badge: null },
    { id: 'report', label: 'Clinical Report', icon: 'fa-file-medical', badge: 'Print' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 transition-all select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-200">
            <i className="fa-solid fa-notes-medical text-lg"></i>
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">MediPulse</h1>
            <p className="text-xs font-medium text-teal-600">Healthcare Analytics</p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            Platform Modules
          </div>
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-sm border border-sky-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                    isActive ? 'bg-sky-600 text-white' : 'text-slate-400'
                  }`}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Database:</span>
            <span className="font-bold text-slate-800 uppercase px-2 py-0.5 bg-slate-100 rounded text-[10px]">
              {systemInfo?.database_engine || 'SQLite'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">ML Status:</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
            </span>
          </div>
          <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
            Engineering Project Demo v1.0
          </div>
        </div>
      </div>
    </aside>
  );
};

window.Sidebar = Sidebar;
