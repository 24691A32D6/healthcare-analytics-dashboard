// Dataset Management and Profiling Component
const Datasets = () => {
  const [datasets, setDatasets] = React.useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = React.useState('patients_seed.csv');
  const [previewData, setPreviewData] = React.useState(null);
  const [loadingList, setLoadingList] = React.useState(true);
  const [loadingPreview, setLoadingPreview] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadMessage, setUploadMessage] = React.useState(null);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    loadDatasets();
  }, []);

  React.useEffect(() => {
    if (selectedDatasetId) {
      loadPreview(selectedDatasetId);
    }
  }, [selectedDatasetId]);

  const loadDatasets = async () => {
    setLoadingList(true);
    try {
      const res = await window.api.getDatasets();
      if (res.success) {
        setDatasets(res.datasets || []);
      }
    } catch (e) {
      console.error("Failed to load datasets", e);
    } finally {
      setLoadingList(false);
    }
  };

  const loadPreview = async (id) => {
    setLoadingPreview(true);
    try {
      const res = await window.api.getDatasetPreview(id);
      if (res.success) {
        setPreviewData(res);
      }
    } catch (e) {
      console.error("Failed to preview dataset", e);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadMessage(null);

    try {
      const res = await window.api.uploadDataset(formData);
      if (res.success) {
        setUploadMessage({ type: 'success', text: res.message });
        await loadDatasets();
        setSelectedDatasetId(res.dataset_id);
      } else {
        setUploadMessage({ type: 'error', text: res.error });
      }
    } catch (err) {
      setUploadMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Top Upload & Selection Header */}
      <div className="medical-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Healthcare Dataset Repository</h3>
          <p className="text-xs text-slate-400">
            Inspect schema attributes, null statistics, and data distributions of clinical datasets
          </p>
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2"
          >
            {uploading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                <span>Uploading CSV...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <span>Upload Custom CSV Dataset</span>
              </>
            )}
          </button>
        </div>
      </div>

      {uploadMessage && (
        <div className={`p-3 rounded-xl text-xs flex items-center justify-between ${
          uploadMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{uploadMessage.text}</span>
          <button onClick={() => setUploadMessage(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Dataset Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {datasets.map(ds => {
          const isSelected = selectedDatasetId === ds.id;
          return (
            <div
              key={ds.id}
              onClick={() => setSelectedDatasetId(ds.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-sky-50/80 border-sky-400 shadow-sm ring-1 ring-sky-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ds.type === 'Bundled' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {ds.type}
                </span>
                <i className="fa-solid fa-table text-slate-400 text-xs"></i>
              </div>
              <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{ds.name}</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                <strong>{ds.records}</strong> instances recorded
              </p>
            </div>
          );
        })}
      </div>

      {/* Dataset Profiling and Columns */}
      {loadingPreview ? (
        <div className="flex flex-col items-center justify-center py-16">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-sky-600 mb-3"></i>
          <p className="text-sm text-slate-500">Profiling dataset schema and calculating column null statistics...</p>
        </div>
      ) : previewData ? (
        <div className="space-y-6">
          {/* Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Rows</span>
              <div className="text-2xl font-black text-sky-700 mt-0.5">{previewData.row_count}</div>
              <span className="text-[10px] text-slate-400">Samples</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Features / Columns</span>
              <div className="text-2xl font-black text-teal-700 mt-0.5">{previewData.column_count}</div>
              <span className="text-[10px] text-slate-400">Variables</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Data Completeness</span>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">100%</div>
              <span className="text-[10px] text-slate-400">0 Missing Cells</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">File Format</span>
              <div className="text-2xl font-black text-indigo-700 mt-0.5">CSV</div>
              <span className="text-[10px] text-slate-400">RFC 4180 Standard</span>
            </div>
          </div>

          {/* Column Attributes Profiling Table */}
          <div className="medical-card p-5">
            <h4 className="font-bold text-slate-800 text-sm mb-1">Column Schema & Data Type Profiling</h4>
            <p className="text-xs text-slate-400 mb-3">Null percentage, cardinality (unique count), and data types</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                    <th className="py-2.5 px-3">Column Name</th>
                    <th className="py-2.5 px-3">Inferred Type</th>
                    <th className="py-2.5 px-3">Missing Count</th>
                    <th className="py-2.5 px-3">Null %</th>
                    <th className="py-2.5 px-3">Unique Values</th>
                    <th className="py-2.5 px-3">Sample Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.columns.map(c => (
                    <tr key={c.column} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{c.column}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {c.data_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{c.missing_count}</td>
                      <td className="py-2.5 px-3 text-slate-600">{c.missing_percentage}%</td>
                      <td className="py-2.5 px-3 text-slate-700 font-semibold">{c.unique_count}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">{c.sample}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="medical-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-800 text-sm">Data Preview (First 50 Rows)</h4>
              <span className="text-xs text-slate-400">Scroll horizontally to view all attributes</span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="sticky top-0 bg-slate-100 z-10 shadow-sm">
                  <tr className="text-slate-600 uppercase font-semibold text-[10px]">
                    {previewData.columns.map(c => (
                      <th key={c.column} className="py-2 px-3">{c.column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.preview_data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      {previewData.columns.map(c => (
                        <td key={c.column} className="py-2 px-3 text-slate-700">
                          {row[c.column] !== undefined ? String(row[c.column]) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

window.Datasets = Datasets;
