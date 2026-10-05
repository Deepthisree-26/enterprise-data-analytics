import React, { useState, useEffect, useRef } from 'react';
import {
  fetchDepartments,
  validateDataset,
  importDataset,
  fetchUploadHistory,
} from '../services/dataService';

interface DepartmentConfig {
  name: string;
  dataset_types: string[];
  description: string;
  required_columns: string[];
  column_types: Record<string, string>;
}

interface ValidationError {
  row: number;
  column: string;
  error: string;
  severity: 'Critical' | 'Warning';
}

interface ValidationResult {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  warnings_count: number;
  status: string;
  can_import: boolean;
  errors: ValidationError[];
  preview: any[];
  file_name?: string;
}

const departmentIcons: Record<string, string> = {
  Sales: '💼',
  Customers: '👥',
  Products: '📦',
  Inventory: '🏭',
  Finance: '💰',
  Marketing: '🎯',
  HR: '👔',
};

const DataIngestionCenter: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentConfig[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('Sales');
  const [selectedDatasetType, setSelectedDatasetType] = useState<string>('Sales Transactions');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showErrorTable, setShowErrorTable] = useState<boolean>(true);
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [importNotification, setImportNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDepartments()
      .then((data) => {
        setDepartments(data || []);
        if (data && data.length > 0) {
          setSelectedDept(data[0].name);
          setSelectedDatasetType(data[0].dataset_types[0]);
        }
      })
      .catch(console.error);

    loadHistory();
  }, []);

  const loadHistory = () => {
    fetchUploadHistory()
      .then((data) => setHistory(data || []))
      .catch(console.error);
  };

  const handleDeptSelect = (deptName: string) => {
    setSelectedDept(deptName);
    const dept = departments.find((d) => d.name === deptName);
    if (dept && dept.dataset_types.length > 0) {
      setSelectedDatasetType(dept.dataset_types[0]);
    }
    // Reset file and validation on department switch
    setFile(null);
    setValidationResult(null);
    setUploadProgress(0);
    setImportNotification(null);
    setErrorMessage(null);
  };

  const currentDeptConfig = departments.find((d) => d.name === selectedDept);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      setValidationResult(null);
      setUploadProgress(100);
      setImportNotification(null);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      const name = dropped.name.toLowerCase();
      if (name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls')) {
        setFile(dropped);
        setValidationResult(null);
        setUploadProgress(100);
        setImportNotification(null);
        setErrorMessage(null);
      } else {
        setErrorMessage('Please drop a valid .csv or .xlsx file.');
      }
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setIsValidating(true);
    setImportNotification(null);
    setErrorMessage(null);
    try {
      const dept = selectedDept || (departments.length > 0 ? departments[0].name : 'Sales');
      const dType = selectedDatasetType || (departments.find(d => d.name === dept)?.dataset_types?.[0] || 'Sales Transactions');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('department', dept);
      formData.append('dataset_type', dType);
      formData.append('flexible_mode', 'true');

      const res = await validateDataset(formData);
      setValidationResult(res);
      setPreviewPage(1);
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        'Validation failed. Please verify that your file contains data records.';
      setErrorMessage(detail);
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!file || !validationResult || !validationResult.can_import) return;
    setIsImporting(true);
    try {
      const dept = selectedDept || (departments.length > 0 ? departments[0].name : 'Sales');
      const dType = selectedDatasetType || (departments.find(d => d.name === dept)?.dataset_types?.[0] || 'Sales Transactions');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('department', dept);
      formData.append('dataset_type', dType);
      formData.append('flexible_mode', 'true');

      const res = await importDataset(formData);
      setImportNotification(`Successfully imported ${res.imported_rows} records into ${dept}!`);
      // Reload history
      loadHistory();
      // Reset current upload
      setFile(null);
      setValidationResult(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Import failed. Please review validation errors.';
      setErrorMessage(detail);
    } finally {
      setIsImporting(false);
    }
  };

  // Preview filtering & pagination
  const filteredPreview = (validationResult?.preview || []).filter((row) => {
    if (!previewSearch) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(previewSearch.toLowerCase())
    );
  });
  const pageSize = 10;
  const totalPages = Math.ceil(filteredPreview.length / pageSize) || 1;
  const paginatedPreview = filteredPreview.slice(
    (previewPage - 1) * pageSize,
    previewPage * pageSize
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg shadow-sm">
            📥
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Data Ingestion Center
            </h1>
            <p className="text-sm text-slate-400">
              Upload, validate and manage enterprise datasets across departments with strict schema governance.
            </p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {importNotification && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <span className="text-xl">✅</span>
            <span className="font-semibold text-sm">{importNotification}</span>
          </div>
          <button
            onClick={() => setImportNotification(null)}
            className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1 rounded-lg transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start justify-between shadow-lg">
          <div className="flex items-start space-x-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-sm text-rose-200">Validation Notice</h4>
              <p className="text-xs text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3 py-1 rounded-lg transition shrink-0 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* STEP 1: Select Department */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md backdrop-blur-sm">
        <div className="flex items-center space-x-2.5 mb-4">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
            1
          </span>
          <h2 className="text-lg font-bold text-white">Select Department</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Choose the enterprise functional unit for this dataset. Unidentified datasets cannot be imported.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {departments.map((dept) => {
            const isSelected = selectedDept === dept.name;
            return (
              <button
                key={dept.name}
                onClick={() => handleDeptSelect(dept.name)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-2xl mb-1">{departmentIcons[dept.name] || '📊'}</span>
                <span className="font-semibold text-xs">{dept.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* STEP 2: Select Dataset Type */}
      {currentDeptConfig && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md backdrop-blur-sm">
          <div className="flex items-center space-x-2.5 mb-4">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="text-lg font-bold text-white">Select Dataset Type</h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {currentDeptConfig.dataset_types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedDatasetType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                  selectedDatasetType === type
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* STEP 3: Smart Schema Adaptation */}
      {currentDeptConfig && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="text-lg font-bold text-white">
                Universal Schema Adaptation ({selectedDept} • {selectedDatasetType})
              </h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-mono">
              Any Columns Accepted
            </span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4 text-xs text-emerald-300 flex items-center space-x-2">
            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              <strong>Flexible Ingestion Active:</strong> You can upload CSV or XLSX datasets with <em>any</em> column headers. The system automatically normalizes headers, maps aliases, and synthesizes missing attributes dynamically.
            </span>
          </div>

          <div className="text-xs text-slate-400 mb-2 font-medium">Standard Model Target Fields (Automatically mapped from your columns):</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {currentDeptConfig.required_columns.map((col) => {
              const colType = currentDeptConfig.column_types[col] || 'string';
              return (
                <div
                  key={col}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-slate-200">{col}</span>
                  <span className="text-[10px] uppercase font-mono text-emerald-400 mt-1">
                    {colType}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* STEP 4: Upload File */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md backdrop-blur-sm">
        <div className="flex items-center space-x-2.5 mb-4">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
            4
          </span>
          <h2 className="text-lg font-bold text-white">Upload File</h2>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-600/10'
              : 'border-slate-700/80 bg-slate-950/30 hover:border-slate-600'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            className="hidden"
            id="file-upload-input"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-2xl text-indigo-400">
              📁
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Drag & Drop Dataset Here</p>
              <p className="text-xs text-slate-400 mt-0.5">or choose a file from your computer</p>
            </div>
            <label
              htmlFor="file-upload-input"
              className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-600/20"
            >
              Browse Files
            </label>
            <span className="text-[11px] text-slate-500">Supported Formats: .csv, .xlsx, .xls</span>
          </div>
        </div>

        {/* Selected File Details */}
        {file && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">📄</span>
              <div>
                <p className="text-sm font-semibold text-white">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setFile(null);
                  setValidationResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-xs text-slate-400 hover:text-rose-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleValidate}
                disabled={isValidating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
              >
                {isValidating ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Validating...</span>
                  </>
                ) : (
                  <span>Validate Dataset</span>
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* STEP 5: Validation Result UI */}
      {validationResult && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                5
              </span>
              <h2 className="text-lg font-bold text-white">Dataset Validation Result</h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                validationResult.can_import
                  ? validationResult.warnings_count > 0
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}
            >
              {validationResult.status}
            </span>
          </div>

          {/* Metrics Recap */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block">Total Rows</span>
              <span className="text-lg font-bold text-white mt-1 block">
                {validationResult.total_rows.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-emerald-400 font-semibold block">Valid Rows</span>
              <span className="text-lg font-bold text-emerald-300 mt-1 block">
                {validationResult.valid_rows.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-rose-400 font-semibold block">Invalid Rows</span>
              <span className="text-lg font-bold text-rose-300 mt-1 block">
                {validationResult.invalid_rows.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-amber-400 font-semibold block">Warnings</span>
              <span className="text-lg font-bold text-amber-300 mt-1 block">
                {validationResult.warnings_count.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Validation Issues Table */}
          {validationResult.errors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setShowErrorTable(!showErrorTable)}
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-1"
                >
                  <span>{showErrorTable ? '▼' : '►'}</span>
                  <span>Validation Issues & Diagnostics ({validationResult.errors.length})</span>
                </button>
              </div>

              {showErrorTable && (
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Row</th>
                        <th className="py-2.5 px-3">Column</th>
                        <th className="py-2.5 px-3">Severity</th>
                        <th className="py-2.5 px-3">Error / Diagnostic Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {validationResult.errors.map((err, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-mono text-slate-400">
                            {err.row === 0 ? 'Header' : err.row}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-300">{err.column}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                err.severity === 'Critical'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {err.severity}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-300">{err.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Data Preview Table */}
          {validationResult.preview && validationResult.preview.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    6
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Data Preview (First {validationResult.preview.length} Rows)
                  </h3>
                </div>
                <input
                  type="text"
                  placeholder="Search preview..."
                  value={previewSearch}
                  onChange={(e) => {
                    setPreviewSearch(e.target.value);
                    setPreviewPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48"
                />
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/50">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      {Object.keys(validationResult.preview[0] || {}).map((header) => (
                        <th key={header} className="py-2.5 px-3">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {paginatedPreview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        {Object.values(row).map((val: any, cidx) => (
                          <td key={cidx} className="py-2 px-3 text-slate-300">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Preview Pagination */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Page {previewPage} of {totalPages} ({filteredPreview.length} preview rows)
                </span>
                <div className="flex space-x-2">
                  <button
                    disabled={previewPage <= 1}
                    onClick={() => setPreviewPage(previewPage - 1)}
                    className="px-2.5 py-1 rounded bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-200"
                  >
                    Prev
                  </button>
                  <button
                    disabled={previewPage >= totalPages}
                    onClick={() => setPreviewPage(previewPage + 1)}
                    className="px-2.5 py-1 rounded bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Confirm Import Action Bar */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
            <div>
              <p className="text-sm font-bold text-white">
                Ready to Import: {selectedDept} • {selectedDatasetType}
              </p>
              <p className="text-xs text-slate-400">
                {validationResult.can_import
                  ? `${validationResult.valid_rows} valid records will be stored in database table.`
                  : 'Import blocked: Resolve critical validation errors before proceeding.'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setFile(null);
                  setValidationResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={!validationResult.can_import || isImporting}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                  validationResult.can_import
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isImporting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Importing into Database...</span>
                  </>
                ) : (
                  <span>
                    {validationResult.warnings_count > 0 ? 'Import with Warnings' : 'Confirm Import'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* UPLOAD HISTORY SECTION */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📜</span>
            <h2 className="text-lg font-bold text-white">Upload History & Ingestion Audit</h2>
          </div>
          <button
            onClick={loadHistory}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Refresh History
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No datasets have been uploaded yet. Upload a dataset using the steps above.
          </p>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Dataset Type</th>
                  <th className="py-2.5 px-3">Rows</th>
                  <th className="py-2.5 px-3">Uploaded By</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{h.file_name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-indigo-400 font-medium">
                        {h.department}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{h.dataset_type}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {h.valid_rows || h.total_rows}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{h.uploaded_by}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.status === 'Success'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{h.upload_timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DataIngestionCenter;
