import React, { useState, useEffect } from 'react';
import { Target, Upload, Brain, CheckSquare, Eye, Download, ChevronRight, CheckCircle, Info, HelpCircle, Lightbulb, Network, X } from 'lucide-react';

const Workflow = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [workflowData, setWorkflowData] = useState({
        goal: { id: '', description: '', threshold: 0.95 },
        datasets: [],  // Changed from dataset to datasets (array)
        analysis: null,
        trustGraph: null,  // Added for knowledge graph
        cdes: [],
        rules: [],
        verification: null
    });

    const steps = [
        { id: 1, name: 'Define Goal', icon: Target, color: 'from-blue-600 to-blue-700' },
        { id: 2, name: 'Upload Dataset', icon: Upload, color: 'from-purple-600 to-purple-700' },
        { id: 3, name: 'Generate Analysis', icon: Brain, color: 'from-indigo-600 to-indigo-700' },
        { id: 4, name: 'Trust Graph', icon: Network, color: 'from-teal-600 to-teal-700' },  // NEW STEP
        { id: 5, name: 'Identify CDEs', icon: CheckSquare, color: 'from-violet-600 to-violet-700' },
        { id: 6, name: 'Review Results', icon: Eye, color: 'from-blue-600 to-blue-700' },
        { id: 7, name: 'Export Rules', icon: Download, color: 'from-green-600 to-green-700' }
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
                    {currentStep === 4 && <TrustGraphStep workflowData={workflowData} setWorkflowData={setWorkflowData} />}
                    {currentStep === 5 && <IdentifyCDEsStep workflowData={workflowData} setWorkflowData={setWorkflowData} />}
                    {currentStep === 6 && <ReviewResultsStep workflowData={workflowData} setWorkflowData={setWorkflowData} />}
                    {currentStep === 7 && <ExportRulesStep workflowData={workflowData} setWorkflowData={setWorkflowData} />}
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
    const [selectedGoalType, setSelectedGoalType] = useState('STANDARD_DQ');
    const [goalExplanation, setGoalExplanation] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        // Fetch goal explanation when goal type changes
        if (selectedGoalType) {
            fetch(`http://localhost:8000/explain/goal/${selectedGoalType}`)
                .then(res => res.json())
                .then(data => setGoalExplanation(data))
                .catch(err => console.error('Failed to load explanation:', err));
        }
    }, [selectedGoalType]);

    const handleChange = (field, value) => {
        setWorkflowData({
            ...workflowData,
            goal: { ...workflowData.goal, [field]: value }
        });
    };

    const goalTypes = [
        { value: 'STANDARD_DQ', label: 'Standard Quality', icon: '📊', color: 'blue' },
        { value: 'REGULATORY_DQ', label: 'Regulatory', icon: '📋', color: 'purple' },
        { value: 'AI_DQ', label: 'AI/ML', icon: '🤖', color: 'indigo' }
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white">
                        <Target size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Define Your Data Quality Goal</h2>
                        <p className="text-gray-600">Set the objective and quality threshold for your data initiative</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                >
                    <Info size={18} />
                    {showExplanation ? 'Hide' : 'Show'} Help
                </button>
            </div>

            <div className="space-y-6">
                {/* Goal Type Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Select Quality Goal Type</label>
                    <div className="grid grid-cols-3 gap-4">
                        {goalTypes.map(type => (
                            <div
                                key={type.value}
                                onClick={() => setSelectedGoalType(type.value)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    selectedGoalType === type.value
                                        ? `border-${type.color}-500 bg-${type.color}-50 shadow-lg`
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="text-3xl mb-2">{type.icon}</div>
                                <div className="font-bold text-gray-900">{type.label}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                    {type.value === 'STANDARD_DQ' && 'Operational data quality'}
                                    {type.value === 'REGULATORY_DQ' && 'Compliance & audit ready'}
                                    {type.value === 'AI_DQ' && 'ML model fitness'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Goal Explanation Panel */}
                {showExplanation && goalExplanation && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 animate-in fade-in">
                        <div className="flex items-start gap-3 mb-4">
                            <Lightbulb className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                            <div>
                                <h3 className="text-lg font-bold text-blue-900 mb-2">{goalExplanation.title}</h3>
                                <p className="text-blue-800 text-sm mb-4">{goalExplanation.explanation}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white/60 rounded-lg p-3">
                                <div className="text-xs font-semibold text-gray-600 mb-1">Threshold</div>
                                <div className="text-2xl font-bold text-blue-700">{goalExplanation.threshold}</div>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3">
                                <div className="text-xs font-semibold text-gray-600 mb-1">Approval Required</div>
                                <div className="text-2xl font-bold text-blue-700">
                                    {goalExplanation.approval_required ? 'Yes' : 'No'}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="text-sm font-semibold text-blue-900 mb-2">Use Cases:</div>
                            <ul className="text-sm text-blue-800 space-y-1">
                                {goalExplanation.use_cases?.map((uc, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        <span>{uc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <div className="text-sm font-semibold text-blue-900 mb-2">What to Expect:</div>
                            <ul className="text-sm text-blue-800 space-y-1">
                                {goalExplanation.what_to_expect?.map((exp, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-green-600">✓</span>
                                        <span>{exp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

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

// Step 2: Upload Dataset (Multiple Files Support)
const UploadDatasetStep = ({ workflowData, setWorkflowData }) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState(workflowData.datasets || []);

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
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (newFiles) => {
        const validFiles = newFiles.filter(file => {
            const isValid = file.name.endsWith('.csv') || file.name.endsWith('.parquet');
            const isUnderLimit = file.size <= 100 * 1024 * 1024; // 100MB
            return isValid && isUnderLimit;
        });

        const fileObjects = validFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type || (file.name.endsWith('.csv') ? 'text/csv' : 'application/parquet'),
            file: file,
            id: `${file.name}-${Date.now()}`
        }));

        const updatedFiles = [...files, ...fileObjects];
        setFiles(updatedFiles);
        setWorkflowData({
            ...workflowData,
            datasets: updatedFiles
        });
    };

    const removeFile = (fileId) => {
        const updatedFiles = files.filter(f => f.id !== fileId);
        setFiles(updatedFiles);
        setWorkflowData({
            ...workflowData,
            datasets: updatedFiles
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white">
                        <Upload size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Upload Your Datasets</h2>
                        <p className="text-gray-600">Upload one or more CSV or Parquet files for quality analysis</p>
                    </div>
                </div>
                {files.length > 0 && (
                    <div className="text-right">
                        <div className="text-sm text-gray-600">Files Uploaded</div>
                        <div className="text-2xl font-bold text-purple-700">{files.length}</div>
                    </div>
                )}
            </div>

            {/* Upload Area */}
            <div
                className={`relative border-3 border-dashed rounded-xl p-8 text-center transition-all mb-6 ${
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
                    multiple
                    onChange={handleChange}
                />
                
                <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                    Drag and drop your datasets here
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
                >
                    Browse Files
                </label>
                <p className="text-xs text-gray-500 mt-4">
                    Supported formats: CSV, Parquet | Max 100MB per file | Multiple files allowed
                </p>
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Uploaded Files ({files.length})</h3>
                    {files.map((file) => (
                        <div key={file.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">{file.name}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {(file.size / 1024).toFixed(2)} KB • {file.type || 'Unknown type'}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Remove file"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Step 3: Generate Analysis
const GenerateAnalysisStep = ({ workflowData, setWorkflowData }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleAnalyze = async () => {
        if (!workflowData.datasets || workflowData.datasets.length === 0) {
            alert('Please upload at least one dataset first');
            return;
        }

        setAnalyzing(true);
        setProgress(0);

        // In a real implementation, you would upload files to the backend here
        // For now, we'll simulate the analysis
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setAnalyzing(false);
                    
                    // Generate analysis results based on uploaded files
                    const totalRows = workflowData.datasets.reduce((sum, ds) => sum + Math.floor(Math.random() * 10000), 0);
                    const analysis = {
                        datasets: workflowData.datasets.map(ds => ({
                            name: ds.name,
                            columns: Math.floor(Math.random() * 20) + 5,
                            rows: Math.floor(Math.random() * 10000) + 1000,
                            size: ds.size
                        })),
                        totalColumns: workflowData.datasets.reduce((sum, ds) => sum + (Math.floor(Math.random() * 20) + 5), 0),
                        totalRows: totalRows,
                        nullValues: Math.floor(totalRows * 0.01),
                        duplicates: Math.floor(totalRows * 0.002),
                        dataTypes: { 
                            numeric: Math.floor(Math.random() * 10) + 3, 
                            categorical: Math.floor(Math.random() * 8) + 2,
                            datetime: Math.floor(Math.random() * 3) + 1
                        }
                    };
                    
                    setWorkflowData({
                        ...workflowData,
                        analysis: analysis
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
                        Click below to start AI-powered analysis of your {workflowData.datasets?.length || 0} dataset(s)
                    </p>
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing || !workflowData.datasets || workflowData.datasets.length === 0}
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
                <div>
                    {/* Overall Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                            <div className="text-3xl font-bold text-blue-700">{workflowData.analysis.totalColumns}</div>
                            <div className="text-sm text-blue-600 font-semibold mt-1">Total Columns</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                            <div className="text-3xl font-bold text-purple-700">{workflowData.analysis.totalRows.toLocaleString()}</div>
                            <div className="text-sm text-purple-600 font-semibold mt-1">Total Rows</div>
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

                    {/* Per-Dataset Breakdown */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Breakdown</h3>
                        <div className="space-y-3">
                            {workflowData.analysis.datasets?.map((ds, idx) => (
                                <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">{ds.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {ds.columns} columns • {ds.rows.toLocaleString()} rows • {(ds.size / 1024).toFixed(2)} KB
                                            </div>
                                        </div>
                                        <CheckCircle className="text-green-600" size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Step 4: Trust Graph Visualization
const TrustGraphStep = ({ workflowData, setWorkflowData }) => {
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Generate trust graph when component mounts
        if (workflowData.analysis && !graphData) {
            generateTrustGraph();
        }
    }, [workflowData.analysis]);

    const generateTrustGraph = () => {
        setLoading(true);
        
        // Simulate trust graph generation
        setTimeout(() => {
            const graph = {
                nodes: [
                    // Dataset nodes
                    ...workflowData.analysis.datasets.map((ds, idx) => ({
                        id: `dataset_${idx}`,
                        label: ds.name,
                        type: 'dataset',
                        color: '#7c3aed'
                    })),
                    // Column nodes (sample)
                    { id: 'col_customer_id', label: 'customer_id', type: 'column', color: '#2563eb' },
                    { id: 'col_email', label: 'email', type: 'column', color: '#2563eb' },
                    { id: 'col_purchase_amount', label: 'purchase_amount', type: 'column', color: '#2563eb' },
                    { id: 'col_status', label: 'status', type: 'column', color: '#2563eb' },
                    // Glossary nodes
                    { id: 'gloss_customer', label: 'Customer', type: 'glossary', color: '#059669' },
                    { id: 'gloss_transaction', label: 'Transaction', type: 'glossary', color: '#059669' },
                ],
                edges: [
                    // Dataset to Column relationships
                    { from: 'dataset_0', to: 'col_customer_id', label: 'contains' },
                    { from: 'dataset_0', to: 'col_email', label: 'contains' },
                    { from: 'dataset_0', to: 'col_purchase_amount', label: 'contains' },
                    { from: 'dataset_0', to: 'col_status', label: 'contains' },
                    // Column to Glossary relationships
                    { from: 'col_customer_id', to: 'gloss_customer', label: 'represents' },
                    { from: 'col_email', to: 'gloss_customer', label: 'represents' },
                    { from: 'col_purchase_amount', to: 'gloss_transaction', label: 'represents' },
                ],
                stats: {
                    totalNodes: 10,
                    totalEdges: 7,
                    datasets: workflowData.analysis.datasets.length,
                    columns: 4,
                    glossaryTerms: 2
                }
            };
            
            setGraphData(graph);
            setWorkflowData({
                ...workflowData,
                trustGraph: graph
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white">
                    <Network size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Trust Graph</h2>
                    <p className="text-gray-600">Semantic relationships between datasets, columns, and business terms</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <Network size={64} className="mx-auto text-teal-600 mb-6 animate-pulse" />
                    <p className="text-gray-600">Generating trust graph...</p>
                </div>
            ) : graphData ? (
                <div>
                    {/* Graph Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
                            <div className="text-2xl font-bold text-purple-700">{graphData.stats.datasets}</div>
                            <div className="text-xs text-purple-600 font-semibold mt-1">Datasets</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
                            <div className="text-2xl font-bold text-blue-700">{graphData.stats.columns}</div>
                            <div className="text-xs text-blue-600 font-semibold mt-1">Columns</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
                            <div className="text-2xl font-bold text-green-700">{graphData.stats.glossaryTerms}</div>
                            <div className="text-xs text-green-600 font-semibold mt-1">Glossary Terms</div>
                        </div>
                        <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border-2 border-teal-200">
                            <div className="text-2xl font-bold text-teal-700">{graphData.stats.totalNodes}</div>
                            <div className="text-xs text-teal-600 font-semibold mt-1">Total Nodes</div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border-2 border-indigo-200">
                            <div className="text-2xl font-bold text-indigo-700">{graphData.stats.totalEdges}</div>
                            <div className="text-xs text-indigo-600 font-semibold mt-1">Relationships</div>
                        </div>
                    </div>

                    {/* Graph Visualization (Simplified) */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-8 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Graph Structure</h3>
                        <div className="space-y-6">
                            {/* Datasets Layer */}
                            <div>
                                <div className="text-sm font-semibold text-purple-700 mb-2">📊 Datasets</div>
                                <div className="flex flex-wrap gap-2">
                                    {graphData.nodes.filter(n => n.type === 'dataset').map(node => (
                                        <div key={node.id} className="px-4 py-2 bg-purple-100 border-2 border-purple-300 rounded-lg text-sm font-semibold text-purple-800">
                                            {node.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Columns Layer */}
                            <div>
                                <div className="text-sm font-semibold text-blue-700 mb-2">📋 Columns (CDEs)</div>
                                <div className="flex flex-wrap gap-2">
                                    {graphData.nodes.filter(n => n.type === 'column').map(node => (
                                        <div key={node.id} className="px-4 py-2 bg-blue-100 border-2 border-blue-300 rounded-lg text-sm font-semibold text-blue-800">
                                            {node.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Glossary Layer */}
                            <div>
                                <div className="text-sm font-semibold text-green-700 mb-2">📖 Business Glossary</div>
                                <div className="flex flex-wrap gap-2">
                                    {graphData.nodes.filter(n => n.type === 'glossary').map(node => (
                                        <div key={node.id} className="px-4 py-2 bg-green-100 border-2 border-green-300 rounded-lg text-sm font-semibold text-green-800">
                                            {node.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Relationships Table */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Semantic Relationships</h3>
                        <div className="space-y-2">
                            {graphData.edges.map((edge, idx) => {
                                const fromNode = graphData.nodes.find(n => n.id === edge.from);
                                const toNode = graphData.nodes.find(n => n.id === edge.to);
                                return (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <span className="px-3 py-1 bg-gray-200 rounded text-sm font-semibold text-gray-700">
                                            {fromNode?.label}
                                        </span>
                                        <span className="text-gray-500 text-sm">→ {edge.label} →</span>
                                        <span className="px-3 py-1 bg-gray-200 rounded text-sm font-semibold text-gray-700">
                                            {toNode?.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                        <p className="text-sm text-blue-900">
                            <strong>Note:</strong> This trust graph shows the semantic relationships between your datasets, 
                            columns, and business terms. These relationships help identify Critical Data Elements (CDEs) 
                            and inform quality rule selection in the next steps.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <Network size={64} className="mx-auto text-gray-400 mb-6" />
                    <p className="text-gray-600 mb-6">No trust graph available. Please complete the analysis step first.</p>
                </div>
            )}
        </div>
    );
};

// Step 5: Identify CDEs
const IdentifyCDEsStep = ({ workflowData, setWorkflowData }) => {
    const [columns] = useState([
        { name: 'customer_id', type: 'string', importance: 0.95, selected: true },
        { name: 'email', type: 'string', importance: 0.88, selected: true },
        { name: 'purchase_amount', type: 'numeric', importance: 0.92, selected: true },
        { name: 'created_date', type: 'date', importance: 0.75, selected: false },
        { name: 'status', type: 'categorical', importance: 0.82, selected: true },
        { name: 'region', type: 'categorical', importance: 0.65, selected: false },
    ]);
    const [cdeExplanation, setCdeExplanation] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState(null);

    const toggleColumn = (index) => {
        const newColumns = [...columns];
        newColumns[index].selected = !newColumns[index].selected;
        setWorkflowData({
            ...workflowData,
            cdes: newColumns.filter(c => c.selected)
        });
    };

    const showExplanation = async (columnName) => {
        setSelectedColumn(columnName);
        try {
            // Find the column data
            const column = columns.find(c => c.name === columnName);
            if (!column) return;

            const response = await fetch('http://localhost:8000/explain/cde', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    column: columnName,
                    importance_score: column.importance,
                    data_type: column.type,
                    goal: 'STANDARD_DQ',
                    statistics: null
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('CDE Explanation data:', data); // Debug log
            setCdeExplanation(data);
        } catch (err) {
            console.error('Failed to load CDE explanation:', err);
            // Set a fallback explanation to prevent blank page
            setCdeExplanation({
                primary_reason: 'Unable to load explanation',
                importance_level: column.importance >= 0.9 ? 'Critical' : 'High',
                importance_score: column.importance,
                detailed_reasons: ['Explanation service temporarily unavailable'],
                recommendations: ['Please try again later'],
                risk_if_ignored: 'Unable to determine risk at this time'
            });
        }
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
                    Review and adjust as needed. Click <HelpCircle className="inline" size={16} /> to see why each column was selected.
                </p>
            </div>

            {/* CDE Explanation Panel */}
            {cdeExplanation && selectedColumn && (
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl p-6 mb-6 animate-in fade-in">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="text-violet-600 flex-shrink-0 mt-1" size={24} />
                            <div>
                                <h3 className="text-lg font-bold text-violet-900 mb-1">
                                    Why "{selectedColumn}" is Critical
                                </h3>
                                <p className="text-violet-800 text-sm">{cdeExplanation.primary_reason || 'Loading explanation...'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setCdeExplanation(null); setSelectedColumn(null); }}
                            className="text-violet-600 hover:text-violet-800"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/60 rounded-lg p-3">
                            <div className="text-xs font-semibold text-gray-600 mb-1">Importance Level</div>
                            <div className="text-2xl font-bold text-violet-700">{cdeExplanation.importance_level || 'N/A'}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                            <div className="text-xs font-semibold text-gray-600 mb-1">Importance Score</div>
                            <div className="text-2xl font-bold text-violet-700">
                                {cdeExplanation.importance_score != null ? (cdeExplanation.importance_score * 100).toFixed(0) : '0'}%
                            </div>
                        </div>
                    </div>

                    {cdeExplanation.detailed_reasons && cdeExplanation.detailed_reasons.length > 0 && (
                        <div className="mb-4">
                            <div className="text-sm font-semibold text-violet-900 mb-2">Detailed Reasons:</div>
                            <ul className="text-sm text-violet-800 space-y-1">
                                {cdeExplanation.detailed_reasons.map((reason, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-violet-600">•</span>
                                        <span>{reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {cdeExplanation.risk_if_ignored && (
                        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="text-sm font-semibold text-orange-900 mb-1">⚠️ Risk if Ignored:</div>
                            <div className="text-sm text-orange-800">{cdeExplanation.risk_if_ignored}</div>
                        </div>
                    )}

                    {cdeExplanation.recommendations && cdeExplanation.recommendations.length > 0 && (
                        <div>
                            <div className="text-sm font-semibold text-violet-900 mb-2">Recommended Checks:</div>
                            <div className="flex flex-wrap gap-2">
                                {cdeExplanation.recommendations.map((check, i) => (
                                    <span key={i} className="px-3 py-1 bg-violet-200 text-violet-800 rounded-full text-xs font-semibold">
                                        {check}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-3">
                {columns.map((col, index) => (
                    <div
                        key={col.name}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            col.selected 
                                ? 'border-violet-500 bg-violet-50' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleColumn(index)}>
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
                            <button
                                onClick={(e) => { e.stopPropagation(); showExplanation(col.name); }}
                                className="p-2 hover:bg-violet-100 rounded-lg transition"
                                title="Why was this selected?"
                            >
                                <HelpCircle size={20} className="text-violet-600" />
                            </button>
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

// Step 6: Review Results
const ReviewResultsStep = ({ workflowData, setWorkflowData }) => {
    const [rules] = useState([
        { column: 'customer_id', type: 'not_null', dimension: 'Completeness', severity: 'Critical' },
        { column: 'email', type: 'regex_match', dimension: 'Validity', severity: 'High' },
        { column: 'purchase_amount', type: 'range', dimension: 'Validity', severity: 'High' },
        { column: 'status', type: 'not_null', dimension: 'Completeness', severity: 'Medium' },
    ]);

    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [ruleExplanation, setRuleExplanation] = useState(null);
    const [showRuleExplanations, setShowRuleExplanations] = useState(false);

    useEffect(() => {
        // Fetch rule selection explanation
        if (showRuleExplanations) {
            // Convert rules to the format expected by the API
            const selectedRules = rules.map(rule => ({
                rule_id: `rule_${rule.column}_${rule.type}`,
                name: `${rule.column} ${rule.type}`,
                description: `Check ${rule.type} for ${rule.column}`,
                column: rule.column,
                rule_type: rule.type,
                dimension: rule.dimension,
                severity: rule.severity.toUpperCase(),
                goal: 'STANDARD_DQ'
            }));

            const allPossibleRules = ['not_null', 'regex_match', 'range', 'unique', 'referential_integrity', 'statistical_outlier'];

            fetch('http://localhost:8000/explain/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selected_rules: selectedRules,
                    all_possible_rules: allPossibleRules,
                    goal: 'STANDARD_DQ',
                    cdes: ['customer_id', 'email', 'purchase_amount', 'status']
                })
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`API error: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('Rule Explanation data:', data); // Debug log
                setRuleExplanation(data);
            })
            .catch(err => {
                console.error('Failed to load rule explanation:', err);
                // Provide fallback data to prevent blank page
                setRuleExplanation({
                    total_rules_selected: rules.length,
                    goal: 'STANDARD_DQ',
                    selection_criteria: 'Unable to load explanation - service temporarily unavailable',
                    selected_rules: rules.map(rule => ({
                        rule_type: rule.type,
                        column: rule.column,
                        dimension: rule.dimension,
                        reason: 'Explanation unavailable',
                        explanation: 'Please try again later'
                    })),
                    not_applicable_rules: [],
                    coverage_analysis: 'Unable to analyze coverage at this time',
                    recommendations: ['Please try again later']
                });
            });
        }
    }, [showRuleExplanations, rules]);

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
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white">
                        <Eye size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Review Generated DQ Rules</h2>
                        <p className="text-gray-600">AI-generated rules based on your CDEs and quality goals</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowRuleExplanations(!showRuleExplanations)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                >
                    <Lightbulb size={18} />
                    {showRuleExplanations ? 'Hide' : 'Show'} Explanations
                </button>
            </div>

            {/* Rule Selection Explanation */}
            {showRuleExplanations && ruleExplanation && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6 animate-in fade-in">
                    <div className="flex items-start gap-3 mb-4">
                        <Lightbulb className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-blue-900 mb-2">Why These Rules Were Selected</h3>
                            <p className="text-blue-800 text-sm mb-3">
                                Based on your <strong>{ruleExplanation.goal || 'STANDARD_DQ'}</strong> goal and selected CDEs, we applied <strong>{ruleExplanation.total_rules_selected || 0} rules</strong>.
                            </p>
                            {ruleExplanation.selection_criteria && (
                                <div className="text-sm text-blue-700 bg-blue-100 rounded p-2 mb-3">
                                    <strong>Selection Criteria:</strong> {ruleExplanation.selection_criteria}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                            <div className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <span className="text-green-600 text-lg">✓</span>
                                Selected Rules ({ruleExplanation.selected_rules?.length || 0})
                            </div>
                            <ul className="text-sm space-y-3">
                                {ruleExplanation.selected_rules && ruleExplanation.selected_rules.length > 0 ? (
                                    ruleExplanation.selected_rules.map((rule, i) => (
                                        <li key={i} className="bg-white rounded-lg p-3 border border-green-200">
                                            <div className="flex items-start gap-2">
                                                <span className="text-green-600 font-bold">✓</span>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900">{rule.rule_type || rule.type || 'Unknown'}</div>
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        Column: {rule.column || 'N/A'} | Dimension: {rule.dimension || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-700 mt-2">{rule.reason || rule.explanation || 'No explanation available'}</div>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 italic">No selected rules to display</li>
                                )}
                            </ul>
                        </div>

                        <div>
                            <div className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <span className="text-gray-400 text-lg">✗</span>
                                Not Applicable ({ruleExplanation.not_applicable_rules?.length || 0})
                            </div>
                            <ul className="text-sm space-y-3">
                                {ruleExplanation.not_applicable_rules && ruleExplanation.not_applicable_rules.length > 0 ? (
                                    ruleExplanation.not_applicable_rules.map((rule, i) => (
                                        <li key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-start gap-2">
                                                <span className="text-gray-400 font-bold">✗</span>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-700">{rule.rule_type || rule.type || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-600 mt-2">{rule.reason || rule.explanation || 'No explanation available'}</div>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 italic">All applicable rules were selected</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {ruleExplanation.coverage_analysis && (
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="text-sm font-semibold text-blue-900 mb-2">📊 Coverage Analysis:</div>
                            <div className="text-sm text-blue-800">
                                {typeof ruleExplanation.coverage_analysis === 'string' 
                                    ? ruleExplanation.coverage_analysis 
                                    : JSON.stringify(ruleExplanation.coverage_analysis)}
                            </div>
                        </div>
                    )}

                    {ruleExplanation.recommendations && ruleExplanation.recommendations.length > 0 && (
                        <div className="mt-4 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                            <div className="text-sm font-semibold text-indigo-900 mb-2">💡 Recommendations:</div>
                            <ul className="text-sm text-indigo-800 space-y-1">
                                {ruleExplanation.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span>•</span>
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

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

// Step 7: Export Rules
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
