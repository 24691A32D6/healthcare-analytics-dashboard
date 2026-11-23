// Main Dashboard Component with 8 KPI Cards and 10 Interactive Chart.js Visualizations
const Dashboard = ({ dashboardData, onOpenAddPatient, setActiveTab }) => {
  const chartRefs = {
    ageGroup: React.useRef(null),
    gender: React.useRef(null),
    disease: React.useRef(null),
    diabetesRisk: React.useRef(null),
    heartRisk: React.useRef(null),
    monthlyReg: React.useRef(null),
    bpByAge: React.useRef(null),
    glucose: React.useRef(null),
    bmi: React.useRef(null),
    summaryRadar: React.useRef(null)
  };

  const chartInstances = React.useRef({});

  React.useEffect(() => {
    if (!dashboardData || !dashboardData.charts) return;

    const { charts } = dashboardData;

    // Helper to safely re-create chart
    const createOrUpdate = (key, canvas, config) => {
      if (!canvas) return;
      if (chartInstances.current[key]) {
        chartInstances.current[key].destroy();
      }
      chartInstances.current[key] = new Chart(canvas, config);
    };

    // 1. Age Group Chart
    if (chartRefs.ageGroup.current) {
      const labels = Object.keys(charts.age_groups || {});
      const values = Object.values(charts.age_groups || {});
      createOrUpdate('ageGroup', chartRefs.ageGroup.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Patients',
            data: values,
            backgroundColor: '#0284c7',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    // 2. Gender Chart
    if (chartRefs.gender.current) {
      createOrUpdate('gender', chartRefs.gender.current, {
        type: 'doughnut',
        data: {
          labels: ['Male', 'Female'],
          datasets: [{
            data: [charts.gender_distribution?.Male || 0, charts.gender_distribution?.Female || 0],
            backgroundColor: ['#0284c7', '#ec4899'],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 3. Disease Distribution
    if (chartRefs.disease.current) {
      const labels = Object.keys(charts.disease_distribution || {});
      const values = Object.values(charts.disease_distribution || {});
      createOrUpdate('disease', chartRefs.disease.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Diagnosed Cases',
            data: values,
            backgroundColor: '#0d9488',
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    // 4. Diabetes Risk Distribution
    if (chartRefs.diabetesRisk.current) {
      createOrUpdate('diabetesRisk', chartRefs.diabetesRisk.current, {
        type: 'doughnut',
        data: {
          labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
          datasets: [{
            data: [
              charts.diabetes_risk_distribution?.Low || 0,
              charts.diabetes_risk_distribution?.Moderate || 0,
              charts.diabetes_risk_distribution?.High || 0
            ],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 5. Heart Risk Distribution
    if (chartRefs.heartRisk.current) {
      createOrUpdate('heartRisk', chartRefs.heartRisk.current, {
        type: 'doughnut',
        data: {
          labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
          datasets: [{
            data: [
              charts.heart_risk_distribution?.Low || 0,
              charts.heart_risk_distribution?.Moderate || 0,
              charts.heart_risk_distribution?.High || 0
            ],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 6. Monthly Registration Line Chart
    if (chartRefs.monthlyReg.current) {
      const labels = Object.keys(charts.monthly_registration || {});
      const values = Object.values(charts.monthly_registration || {});
      createOrUpdate('monthlyReg', chartRefs.monthlyReg.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Registrations',
            data: values,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#0284c7'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    // 7. Average BP by Age Group Dual Bar
    if (chartRefs.bpByAge.current) {
      const labels = Object.keys(charts.blood_pressure_by_age || {});
      const systolic = labels.map(k => charts.blood_pressure_by_age[k]?.systolic_bp || 0);
      const diastolic = labels.map(k => charts.blood_pressure_by_age[k]?.diastolic_bp || 0);
      createOrUpdate('bpByAge', chartRefs.bpByAge.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Systolic (mmHg)', data: systolic, backgroundColor: '#0284c7', borderRadius: 4 },
            { label: 'Diastolic (mmHg)', data: diastolic, backgroundColor: '#10b981', borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      });
    }

    // 8. Glucose Distribution
    if (chartRefs.glucose.current) {
      const labels = Object.keys(charts.glucose_distribution || {});
      const values = Object.values(charts.glucose_distribution || {});
      createOrUpdate('glucose', chartRefs.glucose.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Patients',
            data: values,
            backgroundColor: ['#10b981', '#f59e0b', '#ea580c', '#ef4444'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    // 9. BMI Distribution
    if (chartRefs.bmi.current) {
      const labels = Object.keys(charts.bmi_distribution || {});
      const values = Object.values(charts.bmi_distribution || {});
      createOrUpdate('bmi', chartRefs.bmi.current, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: ['#60a5fa', '#34d399', '#fbbf24', '#f87171']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 10. Healthcare Statistics Summary Radar
    if (chartRefs.summaryRadar.current) {
      createOrUpdate('summaryRadar', chartRefs.summaryRadar.current, {
        type: 'radar',
        data: {
          labels: ['Avg Age', 'Avg BMI', 'Systolic BP / 2', 'Diastolic BP', 'Glucose / 2', 'Avg HR'],
          datasets: [{
            label: 'Population Clinical Baseline',
            data: [
              dashboardData.cards?.avg_age || 48,
              26.5,
              62, // 124 / 2
              78,
              55, // 110 / 2
              74
            ],
            backgroundColor: 'rgba(13, 148, 136, 0.2)',
            borderColor: '#0d9488',
            pointBackgroundColor: '#0d9488'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      });
    }

    return () => {
      Object.values(chartInstances.current).forEach(c => c && c.destroy());
    };
  }, [dashboardData]);

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-sky-600 mb-3"></i>
        <p className="text-sm text-slate-500">Loading healthcare statistics and dashboard...</p>
      </div>
    );
  }

  const { cards } = dashboardData;

  const cardConfig = [
    { title: 'Total Patients', val: cards.total_patients, icon: 'fa-hospital-user', color: 'from-sky-500 to-sky-600', textCol: 'text-sky-600', sub: 'Registered population' },
    { title: 'Male Patients', val: cards.male_patients, icon: 'fa-mars', color: 'from-blue-500 to-blue-600', textCol: 'text-blue-600', sub: `${Math.round(cards.male_patients / (cards.total_patients || 1) * 100)}% of total` },
    { title: 'Female Patients', val: cards.female_patients, icon: 'fa-venus', color: 'from-pink-500 to-pink-600', textCol: 'text-pink-600', sub: `${Math.round(cards.female_patients / (cards.total_patients || 1) * 100)}% of total` },
    { title: 'Average Age', val: `${cards.avg_age} yrs`, icon: 'fa-cake-candles', color: 'from-indigo-500 to-indigo-600', textCol: 'text-indigo-600', sub: 'Adult cohort range' },
    { title: 'Diabetes Risk', val: cards.diabetes_risk_patients, icon: 'fa-droplet', color: 'from-amber-500 to-amber-600', textCol: 'text-amber-600', sub: 'Moderate or high risk' },
    { title: 'Heart Risk', val: cards.heart_risk_patients, icon: 'fa-heart-pulse', color: 'from-rose-500 to-rose-600', textCol: 'text-rose-600', sub: 'Cardiovascular concern' },
    { title: 'Healthy Profile', val: cards.healthy_patients, icon: 'fa-shield-heart', color: 'from-emerald-500 to-emerald-600', textCol: 'text-emerald-600', sub: 'Optimal clinical vitals' },
    { title: 'Medical Records', val: cards.total_medical_records, icon: 'fa-file-waveform', color: 'from-teal-500 to-teal-600', textCol: 'text-teal-600', sub: 'Consultation records' },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-teal-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold mb-2">
            <i className="fa-solid fa-sparkles text-amber-300"></i>
            <span>Machine Learning & Health Analytics Platform</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Population Health & Disease Risk Intelligence</h2>
          <p className="text-xs md:text-sm text-sky-100 mt-1">
            Real-time biometric monitoring, predictive risk estimation for diabetes & cardiovascular disorders, and automated medical reporting.
          </p>
        </div>
        <div className="z-10 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('prediction')}
            className="px-4 py-2.5 bg-white text-sky-900 rounded-xl font-bold text-xs hover:bg-sky-50 shadow-md transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-wand-magic-sparkles text-sky-600"></i>
            <span>Run ML Assessment</span>
          </button>
          <button
            onClick={onOpenAddPatient}
            className="px-4 py-2.5 bg-teal-500/30 hover:bg-teal-500/40 border border-teal-300/40 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add Patient</span>
          </button>
        </div>
        {/* Subtle decorative circles */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
      </div>

      {/* 8 Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cardConfig.map((card, i) => (
          <div key={i} className="kpi-card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${card.color} text-white flex items-center justify-center text-xs shadow-sm`}>
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
            </div>
            <div>
              <div className={`text-2xl font-extrabold ${card.textCol} tracking-tight`}>{card.val}</div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 10 Interactive Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Chart 1: Age Groups */}
        <div className="medical-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-people-group text-sky-600"></i>
              <span>Patients by Age Group</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Cohorts</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={chartRefs.ageGroup}></canvas>
          </div>
        </div>

        {/* Chart 2: Gender */}
        <div className="medical-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-venus-mars text-pink-600"></i>
              <span>Gender Distribution</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Demographics</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={chartRefs.gender}></canvas>
          </div>
        </div>

        {/* Chart 3: Disease Distribution */}
        <div className="medical-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-stethoscope text-teal-600"></i>
              <span>Prevalence of Conditions</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Clinical History</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={chartRefs.disease}></canvas>
          </div>
        </div>

        {/* Chart 4: Diabetes Risk */}
        <div className="medical-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-droplet text-amber-500"></i>
              <span>Diabetes Risk Stratification</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">ML Estimated</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={chartRefs.diabetesRisk}></canvas>
          </div>
        </div>

        {/* Chart 5: Heart Disease Risk */}
        <div className="medical-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-heart-pulse text-rose-500"></i>
              <span>Cardiovascular Risk</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Cardiac Risk</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={chartRefs.heartRisk}></canvas>
          </div>
        </div>

        {/* Chart 6: Monthly Registration */}
        <div className="medical-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-calendar-check text-sky-600"></i>
              <span>Monthly Registrations</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Timeline</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={chartRefs.monthlyReg}></canvas>
          </div>
        </div>

        {/* Chart 7: Blood Pressure by Age */}
        <div className="medical-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-gauge-high text-indigo-600"></i>
              <span>Average Blood Pressure by Age</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Systolic / Diastolic</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={chartRefs.bpByAge}></canvas>
          </div>
        </div>

        {/* Chart 8: Glucose Levels */}
        <div className="medical-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-cube text-purple-600"></i>
              <span>Fasting Glucose Categories</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">mg/dL</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={chartRefs.glucose}></canvas>
          </div>
        </div>

        {/* Chart 9: BMI Distribution */}
        <div className="medical-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-weight-scale text-emerald-600"></i>
              <span>BMI Clinical Categories</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">WHO Standards</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={chartRefs.bmi}></canvas>
          </div>
        </div>

        {/* Chart 10: Radar Healthcare Summary */}
        <div className="medical-card p-5 flex flex-col lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-compass-drafting text-teal-600"></i>
              <span>Comprehensive Population Health Biometric Radar</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Multi-axis Summary</span>
          </div>
          <div className="h-64 relative">
            <canvas ref={chartRefs.summaryRadar}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
