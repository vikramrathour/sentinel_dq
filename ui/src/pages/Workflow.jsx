import React, { useState } from 'react';
import { Target, Upload, Brain, CheckSquare, Eye, Download, ChevronRight, CheckCircle } from 'lucide-react';

const Workflow = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [workflowData, setWorkflowData] = useState({
        goal: { id: '', description: '', threshold: 0.95 },
        dataset: null,
        analysis: null,
        cdes: [],
        rules: [],
        verification: null
    });

    const steps = [
        { id: 1, name: 'Define Goal', icon: Target, color: 'from-blue-600 to-blue-700' },
        { id: 2, name: 'Upload Dataset', icon: Upload, color: 'from-purple-600 to-purple-700' },
        { id: 3, name: 'Generate Analysis', icon: Brain, color: 'from-indigo-600 to-indigo-700' },
        { id: 4, name: 'Identify CDEs', icon: CheckSquare, color: 'from-violet-600 to-violet-700' },
        { id: 5, name: 'Review Results', icon: Eye, color: 'from-blue-600 to-blue-700' },
        { id: 6, name: 'Export Rules', icon: Download, color: 'from-green-600 to-green-700' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a1f3a] to-[#2d3561] text-white px-8 py-6 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Sentinel-DQ Workflow</h1>
                            <p className="text-blue-200 text-sm">Powered by Xoriant ORIAN AI Platform</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-blue-200">Current Step</div>
                            <div className="text-2xl font-bold">{currentStep} of {steps.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Progress Stepper */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div 
                                    className={`flex flex-col items-center cursor-pointer transition-all ${
                                        currentStep >= step.id ? 'opacity-100' : 'opacity-40'
                                    }`}
                                    onClick={() => setCurrentStep(step.id)}
                                >
                                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg mb-2 ${
                                        currentStep === step.id ? 'ring-4 ring-blue-200 scale-110' : ''
                                    } transition-all`}>
                                        {currentStep > step.id ? (
                                            <CheckCircle size={28} />
                                        ) : (
                                            <step.icon size={28} />
                                        )}
                                    </div>
                                    <span className={`text-xs font-semibold text-center ${
                                        currentStep === step.id ? 'text-blue-700' : 'text-gray-600'
                                    }`}>
                                        {step.name}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-2 rounded ${
                                        currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-xl shadow-md p-8">
                    {currentStep === 1 && <DefineGoalStep workflowData={workflowData} setWorkflowData={setWorkflowData} />}
                    {currentStep === 2 && <UploadDatasetStep workflowData={workflowData} setWorkflowData={setWorkflowData} />}
                    {currentStep === 3 && <GenerateAnalysisStep workflowData={workflowData} setWorkflowData={setWorkflowData} />}
                    {currentStep === 4 && <IdentifyCDEsStep workflowData={workflowData} setWorkflowData={setWorkflowData} />}
                    {currentStep === 5 && <ReviewResultsStep workflowData={workflowData} setWorkflowData={setWorkflowData} />}
                    {currentStep === 6 && <ExportRulesStep workflowData={workflowData} setWorkflowData={setWorkflowData} />}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                    <button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                        disabled={currentStep === steps.length}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg"
                    >
                        Next Step <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Step 1: Define Goal
const DefineGoalStep = ({ workflowData, setWorkflowData }) => {
    const handleChange = (field, value) => {
        setWorkflowData({
            ...workflowData,
            goal: { ...workflowData.goal, [field]: value }
        });
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white">
                    <Target size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Define Your Data Quality Goal</h2>
                    <p className="text-gray-600">Set the objective and quality threshold for your data initiative</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Goal ID / Name</label>
                    <input
                        type="text"
                        value={workflowData.goal.id}
                        onChange={(e) => handleChange('id', e.target.value)}
                        placeholder="e.g., urn:goal:customer_churn_prediction"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                        value={workflowData.goal.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Describe the business objective and expected outcomes..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Definition of Done (DoD) Threshold
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={workflowData.goal.threshold}
                            onChange={(e) => handleChange('threshold', parseFloat(e.target.value))}
                            className="flex-1"
                        />
                        <div className="w-24 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-center font-bold text-lg">
                            {(workflowData.goal.threshold * 100).toFixed(0)}%
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Minimum quality score required to pass validation
                    </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                    <p className="text-sm text-blue-900">
                        <strong>Tip:</strong> A higher threshold ensures stricter data quality but may require more effort to achieve. 
                        Typical values range from 85% to 95% depending on your use case.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Step 2: Upload Dataset
const UploadDatasetStep = ({ workflowData, setWorkflowData }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        setFile(file);
        setWorkflowData({
            ...workflowData,
            dataset: {
                name: file.name,
                size: file.size,
                type: file.type,
                file: file
            }
        });
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white">
                    <Upload size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Upload Your Dataset</h2>
                    <p className="text-gray-600">Upload CSV or Parquet files for quality analysis</p>
                </div>
            </div>

            <div
                className={`relative border-3 border-dashed rounded-xl p-12 text-center transition-all ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.parquet"
                    onChange={handleChange}
                />
                
                {!file ? (
                    <div>
                        <Upload size={64} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                            Drag and drop your dataset here
                        </p>
                        <p className="text-sm text-gray-500 mb-4">or</p>
                        <label
                            htmlFor="file-upload"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
                        >
                            Browse Files
                        </label>
                        <p className="text-xs text-gray-500 mt-4">Supported formats: CSV, Parquet (Max 100MB)</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">File Uploaded Successfully</h3>
                        <div className="text-left max-w-md mx-auto space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Filename:</span>
                                <span className="font-semibold">{file.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Size:</span>
                                <span className="font-semibold">{(file.size / 1024).toFixed(2)} KB</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Type:</span>
                                <span className="font-semibold">{file.type || 'Unknown'}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => { setFile(null); setWorkflowData({ ...workflowData, dataset: null }); }}
                            className="mt-4 text-sm text-red-600 hover:text-red-700 font-semibold"
                        >
                            Remove File
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Step 3: Generate Analysis
const GenerateAnalysisStep = ({ workflowData, setWorkflowData }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleAnalyze = () => {
        setAnalyzing(true);
        setProgress(0);
        
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setAnalyzing(false);
                    // Simulate analysis results
                    setWorkflowData({
                        ...workflowData,
                        analysis: {
                            columns: 12,
                            rows: 5000,
                            nullValues: 45,
                            duplicates: 12,
                            dataTypes: { numeric: 8, categorical: 4 }
                        }
                    });
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white">
                    <Brain size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Generate Data Analysis</h2>
                    <p className="text-gray-600">AI-powered profiling and quality assessment</p>
                </div>
            </div>

            {!workflowData.analysis ? (
                <div className="text-center py-12">
                    <Brain size={64} className="mx-auto text-indigo-600 mb-6" />
                    <p className="text-gray-600 mb-6">
                        Click below to start AI-powered analysis of your dataset
                    </p>
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing || !workflowData.dataset}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg"
                    >
                        {analyzing ? 'Analyzing...' : 'Start Analysis'}
                    </button>

                    {analyzing && (
                        <div className="mt-8 max-w-md mx-auto">
                            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{progress}% Complete</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                        <div className="text-3xl font-bold text-blue-700">{workflowData.analysis.columns}</div>
                        <div className="text-sm text-blue-600 font-semibold mt-1">Columns</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                        <div className="text-3xl font-bold text-purple-700">{workflowData.analysis.rows.toLocaleString()}</div>
                        <div className="text-sm text-purple-600 font-semibold mt-1">Rows</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
                        <div className="text-3xl font-bold text-orange-700">{workflowData.analysis.nullValues}</div>
                        <div className="text-sm text-orange-600 font-semibold mt-1">Null Values</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
                        <div className="text-3xl font-bold text-green-700">{workflowData.analysis.duplicates}</div>
                        <div className="text-sm text-green-600 font-semibold mt-1">Duplicates</div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Step 4: Identify CDEs
const IdentifyCDEsStep = ({ workflowData, setWorkflowData }) => {
    const [columns] = useState([
        { name: 'customer_id', type: 'string', importance: 0.95, selected: true },
        { name: 'email', type: 'string', importance: 0.88, selected: true },
        { name: 'purchase_amount', type: 'numeric', importance: 0.92, selected: true },
        { name: 'created_date', type: 'date', importance: 0.75, selected: false },
        { name: 'status', type: 'categorical', importance: 0.82, selected: true },
        { name: 'region', type: 'categorical', importance: 0.65, selected: false },
    ]);

    const toggleColumn = (index) => {
        const newColumns = [...columns];
        newColumns[index].selected = !newColumns[index].selected;
        setWorkflowData({
            ...workflowData,
            cdes: newColumns.filter(c => c.selected)
        });
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white">
                    <CheckSquare size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Identify Critical Data Elements</h2>
                    <p className="text-gray-600">Select columns that are critical for your business objective</p>
                </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-6">
                <p className="text-sm text-blue-900">
                    <strong>AI Recommendation:</strong> Based on your goal, we've pre-selected columns with high business impact. 
                    Review and adjust as needed.
                </p>
            </div>

            <div className="space-y-3">
                {columns.map((col, index) => (
                    <div
                        key={col.name}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            col.selected 
                                ? 'border-violet-500 bg-violet-50' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => toggleColumn(index)}
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <input
                                type="checkbox"
                                checked={col.selected}
                                onChange={() => {}}
                                className="w-5 h-5 text-violet-600 rounded"
                            />
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{col.name}</div>
                                <div className="text-sm text-gray-500">{col.type}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-600">Importance Score</div>
                                <div className="font-bold text-lg text-violet-700">
                                    {(col.importance * 100).toFixed(0)}%
                                </div>
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full"
                                    style={{ width: `${col.importance * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Selected CDEs:</span>
                    <span className="text-2xl font-bold text-violet-700">
                        {columns.filter(c => c.selected).length} / {columns.length}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Step 5: Review Results
const ReviewResultsStep = ({ workflowData, setWorkflowData }) => {
    const [rules] = useState([
        { column: 'customer_id', type: 'not_null', dimension: 'Completeness', severity: 'Critical' },
        { column: 'email', type: 'regex_match', dimension: 'Validity', severity: 'High' },
        { column: 'purchase_amount', type: 'range', dimension: 'Validity', severity: 'High' },
        { column: 'status', type: 'not_null', dimension: 'Completeness', severity: 'Medium' },
    ]);

    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);

    const handleVerify = () => {
        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            setVerified(true);
            setWorkflowData({
                ...workflowData,
                rules: rules,
                verification: { passed: true, score: 0.94 }
            });
        }, 2000);
    };

    const getSeverityColor = (severity) => {
        switch(severity) {
            case 'Critical': return 'bg-red-100 text-red-700 border-red-300';
            case 'High': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white">
                    <Eye size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Review Generated DQ Rules</h2>
                    <p className="text-gray-600">AI-generated rules based on your CDEs and quality goals</p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {rules.map((rule, index) => (
                    <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-gray-900">{rule.column}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(rule.severity)}`}>
                                        {rule.severity}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold">Type:</span> {rule.type} | 
                                    <span className="font-semibold ml-2">Dimension:</span> {rule.dimension}
                                </div>
                            </div>
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Verify Against Goal</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Run verification to ensure these rules meet your Definition of Done threshold of <strong>{(workflowData.goal.threshold * 100).toFixed(0)}%</strong>
                </p>
                
                {!verified ? (
                    <button
                        onClick={handleVerify}
                        disabled={verifying}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 transition shadow-lg"
                    >
                        {verifying ? 'Verifying...' : 'Verify Rules'}
                    </button>
                ) : (
                    <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-center">
                        <CheckCircle size={48} className="mx-auto text-green-600 mb-2" />
                        <div className="text-xl font-bold text-green-800">Verification Passed!</div>
                        <div className="text-sm text-green-700 mt-1">
                            Quality Score: {(workflowData.verification.score * 100).toFixed(1)}%
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Step 6: Export Rules
const ExportRulesStep = ({ workflowData }) => {
    const [exportFormat, setExportFormat] = useState('yaml');

    const handleExport = () => {
        // Simulate export
        const data = {
            goal: workflowData.goal,
            rules: workflowData.rules,
            verification: workflowData.verification
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sentinel-dq-rules.${exportFormat}`;
        a.click();
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white">
                    <Download size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Export DQ Rules</h2>
                    <p className="text-gray-600">Download rules in your preferred format for deployment</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {['yaml', 'json', 'collibra'].map((format) => (
                    <div
                        key={format}
                        onClick={() => setExportFormat(format)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                            exportFormat === format
                                ? 'border-green-500 bg-green-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-2">{format.toUpperCase()}</div>
                            <div className="text-sm text-gray-600">
                                {format === 'yaml' && 'Standard YAML format'}
                                {format === 'json' && 'JSON format'}
                                {format === 'collibra' && 'Collibra DQ API'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Export Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Goal ID:</span>
                        <div className="font-semibold">{workflowData.goal.id || 'Not set'}</div>
                    </div>
                    <div>
                        <span className="text-gray-600">Total Rules:</span>
                        <div className="font-semibold">{workflowData.rules?.length || 0}</div>
                    </div>
                    <div>
                        <span className="text-gray-600">CDEs Identified:</span>
                        <div className="font-semibold">{workflowData.cdes?.length || 0}</div>
                    </div>
                    <div>
                        <span className="text-gray-600">Verification Status:</span>
                        <div className="font-semibold text-green-600">
                            {workflowData.verification?.passed ? 'Passed' : 'Pending'}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleExport}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition shadow-lg flex items-center justify-center gap-3"
            >
                <Download size={24} />
                Export as {exportFormat.toUpperCase()}
            </button>
        </div>
    );
};

export default Workflow;
