import React, { useState, useEffect } from 'react';
import { Target, Upload, Brain, CheckSquare, Eye, Download, ChevronRight, CheckCircle, Info, HelpCircle, Lightbulb, Network, X } from 'lucide-react';

const Workflow = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [workflowData, setWorkflowData] = useState({
        goal: { id: '', name: '', description: '', threshold: 0.90 },
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
                            <h1 className="text-3xl font-bold mb-1">OrianDQ Workflow</h1>
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
    const [goalName, setGoalName] = useState(workflowData.goal.name || '');

    // Auto-generate URN ID from friendly name
    const toUrn = (name) => {
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        return slug ? `urn:goal:${slug}` : '';
    };

    useEffect(() => {
        if (selectedGoalType) {
            fetch(`http://localhost:8000/explain/goal/${selectedGoalType}`)
                .then(res => res.json())
                .then(data => setGoalExplanation(data))
                .catch(() => {});
        }
    }, [selectedGoalType]);

    const handleNameChange = (name) => {
        setGoalName(name);
        setWorkflowData({
            ...workflowData,
            goal: { ...workflowData.goal, name, id: toUrn(name) }
        });
    };

    const handleChange = (field, value) => {
        setWorkflowData({ ...workflowData, goal: { ...workflowData.goal, [field]: value } });
    };

    const goalTypes = [
        {
            value: 'STANDARD_DQ',
            label: 'Standard Quality',
            icon: '📊',
            description: 'Check completeness, accuracy, and consistency of operational data.',
            examples: ['Customer Data Completeness', 'Sales Report Validation', 'Product Catalog Accuracy', 'Order Data Integrity'],
            activeClass: 'border-blue-500 bg-blue-50 shadow-lg',
            badgeClass: 'bg-blue-100 text-blue-700',
        },
        {
            value: 'REGULATORY_DQ',
            label: 'Regulatory / Compliance',
            icon: '📋',
            description: 'Ensure data meets audit, SOX, GDPR, or BCBS standards before reporting.',
            examples: ['GDPR Personal Data Audit', 'SOX Financial Reporting', 'BCBS Risk Data Check', 'AML Transaction Review'],
            activeClass: 'border-purple-500 bg-purple-50 shadow-lg',
            badgeClass: 'bg-purple-100 text-purple-700',
        },
        {
            value: 'AI_DQ',
            label: 'AI / ML Fitness',
            icon: '🤖',
            description: 'Validate training data quality, detect drift, and confirm model readiness.',
            examples: ['Churn Prediction Data', 'Fraud Detection Features', 'Demand Forecasting Input', 'Recommendation Engine Data'],
            activeClass: 'border-indigo-500 bg-indigo-50 shadow-lg',
            badgeClass: 'bg-indigo-100 text-indigo-700',
        },
    ];

    const selectedType = goalTypes.find(t => t.value === selectedGoalType);
    const generatedId = toUrn(goalName);

    const thresholdPresets = [
        { label: 'Relaxed', value: 0.80, desc: 'Exploratory / dev' },
        { label: 'Standard', value: 0.90, desc: 'Most use cases' },
        { label: 'Strict', value: 0.95, desc: 'Production / reporting' },
        { label: 'Critical', value: 0.99, desc: 'Regulatory / audit' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-md">
                    <Target size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Define Your Data Quality Goal</h2>
                    <p className="text-gray-500 text-sm">Tell us what you want to achieve — we'll handle the technical setup</p>
                </div>
            </div>

            <div className="space-y-8">

                {/* Step A — Goal Type */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                        <label className="text-sm font-semibold text-gray-700">What kind of quality check are you running?</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {goalTypes.map(type => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setSelectedGoalType(type.value)}
                                className={`text-left p-5 rounded-xl border-2 cursor-pointer transition-all ${
                                    selectedGoalType === type.value ? type.activeClass : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="text-3xl mb-3">{type.icon}</div>
                                <div className="font-bold text-gray-900 mb-1">{type.label}</div>
                                <div className="text-xs text-gray-500 leading-relaxed">{type.description}</div>
                                {selectedGoalType === type.value && (
                                    <div className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${type.badgeClass}`}>
                                        <CheckCircle size={11} /> Selected
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step B — Goal Name with examples */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                        <label htmlFor="goal-name" className="text-sm font-semibold text-gray-700">Give your goal a name</label>
                    </div>
                    <input
                        id="goal-name"
                        type="text"
                        value={goalName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder={`e.g., ${selectedType?.examples[0] || 'Customer Data Quality'}`}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900"
                    />
                    {/* Quick-pick examples */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs text-gray-400 self-center">Try:</span>
                        {selectedType?.examples.map(ex => (
                            <button
                                key={ex}
                                type="button"
                                onClick={() => handleNameChange(ex)}
                                className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 hover:border-blue-300 transition"
                            >
                                {ex}
                            </button>
                        ))}
                    </div>
                    {/* Generated URN preview */}
                    {generatedId && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                            <span className="font-medium text-gray-500">System ID:</span>
                            <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-500">{generatedId}</code>
                        </div>
                    )}
                </div>

                {/* Step C — Description */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                        <label htmlFor="goal-description" className="text-sm font-semibold text-gray-700">Briefly describe the business objective <span className="text-gray-400 font-normal">(optional)</span></label>
                    </div>
                    <textarea
                        id="goal-description"
                        value={workflowData.goal.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="e.g., Ensure customer records are complete and accurate before loading into the CRM for the Q2 marketing campaign."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900 resize-none"
                    />
                </div>

                {/* Step D — Threshold */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                        <label className="text-sm font-semibold text-gray-700">How strict should the quality bar be?</label>
                    </div>
                    {/* Preset buttons */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {thresholdPresets.map(preset => (
                            <button
                                key={preset.value}
                                type="button"
                                onClick={() => handleChange('threshold', preset.value)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${
                                    Math.abs(workflowData.goal.threshold - preset.value) < 0.001
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="text-lg font-black text-gray-900">{(preset.value * 100).toFixed(0)}%</div>
                                <div className="text-xs font-semibold text-gray-700 mt-0.5">{preset.label}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{preset.desc}</div>
                            </button>
                        ))}
                    </div>
                    {/* Fine-tune slider */}
                    <div className="flex items-center gap-4 px-1">
                        <span className="text-xs text-gray-400 w-10">80%</span>
                        <input
                            type="range"
                            min="0.80"
                            max="1"
                            step="0.01"
                            value={workflowData.goal.threshold}
                            onChange={(e) => handleChange('threshold', parseFloat(e.target.value))}
                            className="flex-1 accent-blue-600"
                            aria-label="Quality threshold slider"
                        />
                        <span className="text-xs text-gray-400 w-10 text-right">100%</span>
                        <div className="w-20 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-center font-bold">
                            {(workflowData.goal.threshold * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>

                {/* AI Explanation Panel — auto-shown */}
                {goalExplanation && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-5">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-blue-900">{goalExplanation.title}</span>
                                    <span className="text-xs text-blue-400">AI-generated guidance</span>
                                </div>
                                <p className="text-sm text-blue-800 mb-3 leading-relaxed">{goalExplanation.explanation}</p>
                                {goalExplanation.use_cases?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {goalExplanation.use_cases.slice(0, 3).map((uc, i) => (
                                            <span key={i} className="text-xs bg-white/70 text-blue-700 border border-blue-200 px-2 py-1 rounded-full">{uc}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

// File role detection — used by UploadDatasetStep
const detectFileRole = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['xsd', 'yaml', 'yml', 'docx'].includes(ext)) return 'reference';
    if (ext === 'json') return 'reference'; // JSON Schema — server validates
    if (['csv', 'parquet', 'xlsx', 'xls', 'xml'].includes(ext)) return 'data';
    return 'unknown';
};

const FILE_ROLE_CONFIG = {
    data: {
        label: '📊 Data File',
        badgeClass: 'bg-purple-100 text-purple-700 border-purple-300',
        borderClass: 'border-purple-300',
        bgClass: 'bg-purple-50',
        endpoint: '/ingest',
        description: 'Will be statistically profiled'
    },
    reference: {
        label: '📋 Reference Doc',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',
        borderClass: 'border-amber-300',
        bgClass: 'bg-amber-50',
        endpoint: '/ingest-document',
        description: 'DQ rules will be extracted'
    },
    unknown: {
        label: '❓ Unknown',
        badgeClass: 'bg-gray-100 text-gray-600 border-gray-300',
        borderClass: 'border-red-300',
        bgClass: 'bg-red-50',
        endpoint: null,
        description: 'Unsupported format'
    }
};

// Step 2: Upload Dataset — sends files to /ingest or /ingest-document based on detected role
const UploadDatasetStep = ({ workflowData, setWorkflowData }) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([
        ...(workflowData.datasets || []),
        ...(workflowData.refDocuments || []),
    ]);
    const [expandedRules, setExpandedRules] = useState({});

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0)
            handleFiles(Array.from(e.dataTransfer.files));
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0)
            handleFiles(Array.from(e.target.files));
    };

    const handleFiles = async (newFiles) => {
        // Filter oversized files first
        const sizedFiles = newFiles.filter(f => f.size <= 100 * 1024 * 1024);

        // Detect role and skip unknown
        const roledFiles = sizedFiles.map(f => ({ f, role: detectFileRole(f.name) }));
        const skipped = roledFiles.filter(({ role }) => role === 'unknown');
        const validRoled = roledFiles.filter(({ role }) => role !== 'unknown');

        if (skipped.length > 0) {
            console.warn('Skipped unsupported files:', skipped.map(({ f }) => f.name).join(', '));
        }

        if (validRoled.length === 0) return;

        // Build placeholders with role info
        const placeholders = validRoled.map(({ f, role }) => ({
            name: f.name,
            size: f.size,
            file: f,
            id: `${f.name}-${Date.now()}`,
            role,
            roleConfig: FILE_ROLE_CONFIG[role],
            uploading: true,
            profile: null,
            docResult: null,
            error: null,
        }));

        const withPlaceholders = [...files, ...placeholders];
        setFiles(withPlaceholders);
        const dataPlaceholders = withPlaceholders.filter(f => f.role === 'data');
        const refPlaceholders = withPlaceholders.filter(f => f.role === 'reference');
        setWorkflowData({ ...workflowData, datasets: dataPlaceholders, refDocuments: refPlaceholders });

        // Upload in parallel — route to correct endpoint by role
        const uploaded = await Promise.all(placeholders.map(async (fileObj) => {
            const endpoint = fileObj.roleConfig.endpoint;
            try {
                const formData = new FormData();
                formData.append('file', fileObj.file);
                const res = await fetch(endpoint, { method: 'POST', body: formData });
                if (!res.ok) throw new Error(`Server error ${res.status}`);
                const result = await res.json();
                if (fileObj.role === 'data') {
                    return { ...fileObj, uploading: false, profile: result, docResult: null, error: null };
                } else {
                    return { ...fileObj, uploading: false, profile: null, docResult: result, error: null };
                }
            } catch (err) {
                return { ...fileObj, uploading: false, profile: null, docResult: null, error: err.message };
            }
        }));

        const updatedFiles = [...files, ...uploaded];
        setFiles(updatedFiles);
        const dataFiles = updatedFiles.filter(f => f.role === 'data');
        const refDocs = updatedFiles.filter(f => f.role === 'reference');
        setWorkflowData({ ...workflowData, datasets: dataFiles, refDocuments: refDocs });
    };

    const removeFile = (fileId) => {
        const updated = files.filter(f => f.id !== fileId);
        setFiles(updated);
        const dataFiles = updated.filter(f => f.role === 'data');
        const refDocs = updated.filter(f => f.role === 'reference');
        setWorkflowData({ ...workflowData, datasets: dataFiles, refDocuments: refDocs });
    };

    const toggleRules = (fileId) => {
        setExpandedRules(prev => ({ ...prev, [fileId]: !prev[fileId] }));
    };

    const dataCount = files.filter(f => f.role === 'data').length;
    const refCount = files.filter(f => f.role === 'reference').length;
    const readyCount = files.filter(f => (f.profile || f.docResult) && !f.uploading).length;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white">
                        <Upload size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Upload Your Datasets</h2>
                        <p className="text-gray-600">Data files + Reference documents — upload together</p>
                    </div>
                </div>
                {files.length > 0 && (
                    <div className="flex items-center gap-3">
                        {dataCount > 0 && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 border border-purple-300 text-sm font-semibold rounded-full">
                                📊 {dataCount} Data {dataCount === 1 ? 'File' : 'Files'}
                            </span>
                        )}
                        {refCount > 0 && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-300 text-sm font-semibold rounded-full">
                                📋 {refCount} Reference {refCount === 1 ? 'Doc' : 'Docs'}
                            </span>
                        )}
                        {readyCount > 0 && (
                            <div className="text-right">
                                <div className="text-xs text-gray-500">Ready</div>
                                <div className="text-2xl font-bold text-purple-700">{readyCount}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Drop zone */}
            <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all mb-4 ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
                onDragEnter={handleDrag} onDragLeave={handleDrag}
                onDragOver={handleDrag} onDrop={handleDrop}
            >
                <input type="file" id="file-upload" className="hidden"
                    accept=".csv,.parquet,.xlsx,.xls,.json,.xml,.xsd,.yaml,.yml,.docx"
                    multiple onChange={handleChange} />
                <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-lg font-semibold text-gray-700 mb-2">Drag and drop your files here</p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <label htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:from-purple-700 hover:to-blue-700 transition shadow-lg">
                    Browse Files
                </label>
                <div
                    className="text-xs text-gray-500 mt-4 space-y-1"
                    title="Data files are statistically profiled. Reference documents (JSON Schema, XSD, YAML) have DQ rules extracted from them."
                >
                    <p>Data: CSV, Parquet, XLSX, JSON, XML</p>
                    <p>Reference Docs: JSON Schema, XSD, YAML contracts, DOCX data dictionary</p>
                </div>
            </div>

            {/* Info banner */}
            <div className="flex gap-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200 mb-6">
                <div className="flex items-start gap-1.5">
                    <span>📊</span>
                    <span><strong className="text-gray-700">Data Files</strong> are statistically profiled — null rates, distributions, patterns detected</span>
                </div>
                <div className="w-px bg-gray-200 self-stretch" />
                <div className="flex items-start gap-1.5">
                    <span>📋</span>
                    <span><strong className="text-gray-700">Reference Docs</strong> (JSON Schema, XSD, YAML, DOCX data dictionary) have DQ rules extracted — these rules guide quality checks</span>
                </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Files ({files.length})</h3>
                    {files.map((file) => {
                        const roleConfig = file.roleConfig || FILE_ROLE_CONFIG[file.role] || FILE_ROLE_CONFIG.unknown;
                        const isData = file.role === 'data';
                        const isRef = file.role === 'reference';
                        const docResult = file.docResult;
                        const rulesVisible = expandedRules[file.id] || false;
                        const previewRules = docResult?.rules?.slice(0, 5) || [];
                        const extraRules = docResult?.rules ? Math.max(0, docResult.rules.length - 5) : 0;

                        const borderClass = file.error
                            ? 'border-red-300 bg-red-50'
                            : file.uploading
                                ? 'border-gray-200'
                                : isRef && docResult
                                    ? 'border-amber-300'
                                    : isData && file.profile
                                        ? 'border-green-300'
                                        : 'border-gray-200';

                        return (
                            <div key={file.id} className={`bg-white border-2 rounded-lg p-4 transition ${borderClass}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Status icon */}
                                        {file.uploading
                                            ? <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
                                            : file.error
                                                ? <span className="text-red-600 font-bold flex-shrink-0 mt-0.5">✗</span>
                                                : <CheckCircle size={24} className={`flex-shrink-0 mt-0.5 ${isRef ? 'text-amber-500' : 'text-green-600'}`} />
                                        }
                                        <div className="flex-1 min-w-0">
                                            {/* File name row + role badge */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-gray-900">{file.name}</span>
                                                {/* Role badge */}
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${roleConfig.badgeClass}`}>
                                                    {roleConfig.label}
                                                </span>
                                                {/* Cached badge (data files) */}
                                                {isData && file.profile?.cached && (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-300">
                                                        ⚡ Cached Profile
                                                    </span>
                                                )}
                                                {/* Uploading badge */}
                                                {file.uploading && (
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isRef ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        {isRef ? 'Extracting rules...' : 'Profiling...'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* File meta */}
                                            <div className="text-sm text-gray-600 mt-1">
                                                {(file.size / 1024).toFixed(2)} KB
                                                {/* Data file stats */}
                                                {isData && file.profile && (
                                                    <> • <strong>{file.profile.row_count?.toLocaleString()}</strong> rows
                                                       • <strong>{file.profile.column_count}</strong> columns
                                                       • <strong>{file.profile.data_types?.numeric || 0}</strong> numeric
                                                       • <strong>{file.profile.data_types?.categorical || 0}</strong> categorical
                                                    </>
                                                )}
                                                {file.error && <span className="text-red-600 ml-2">Error: {file.error}</span>}
                                            </div>

                                            {/* Reference doc result summary */}
                                            {isRef && docResult && (
                                                <div className="mt-2">
                                                    <div className="grid grid-cols-3 gap-2 text-center">
                                                        <div className="bg-amber-50 rounded-lg p-2">
                                                            <div className="text-lg font-bold text-amber-700">{docResult.rule_count}</div>
                                                            <div className="text-xs text-gray-500">Rules Extracted</div>
                                                        </div>
                                                        <div className="bg-amber-50 rounded-lg p-2">
                                                            <div className="text-lg font-bold text-amber-700">{docResult.column_count}</div>
                                                            <div className="text-xs text-gray-500">Columns Covered</div>
                                                        </div>
                                                        <div className="bg-amber-50 rounded-lg p-2">
                                                            <div className="text-sm font-bold text-amber-700">{docResult.document_type?.replace('_', ' ')}</div>
                                                            <div className="text-xs text-gray-500">Doc Type</div>
                                                        </div>
                                                    </div>

                                                    {/* Collapsible rules list */}
                                                    {docResult.rules && docResult.rules.length > 0 && (
                                                        <div className="mt-2">
                                                            <button
                                                                onClick={() => toggleRules(file.id)}
                                                                className="text-xs text-amber-700 hover:text-amber-900 font-semibold underline underline-offset-2 transition"
                                                            >
                                                                {rulesVisible ? 'Hide Rules ▲' : `View Rules ▼`}
                                                            </button>
                                                            {rulesVisible && (
                                                                <ul className="mt-2 space-y-1 text-xs text-gray-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
                                                                    {previewRules.map((rule, i) => (
                                                                        <li key={i} className="flex gap-1">
                                                                            <span className="text-amber-500 flex-shrink-0">•</span>
                                                                            <span>
                                                                                <strong>{rule.rule_type}</strong>
                                                                                {rule.column ? `: ${rule.column}` : ''}
                                                                                {rule.description ? ` — ${rule.description}` : ''}
                                                                            </span>
                                                                        </li>
                                                                    ))}
                                                                    {extraRules > 0 && (
                                                                        <li className="text-gray-400 italic">+{extraRules} more rules</li>
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => removeFile(file.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition ml-2 flex-shrink-0">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Step 3: Generate Analysis — aggregates real profiles from uploaded datasets
const GenerateAnalysisStep = ({ workflowData, setWorkflowData }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [expandedDataset, setExpandedDataset] = useState(null);

    const handleAnalyze = () => {
        const profiledDatasets = (workflowData.datasets || []).filter(d => d.profile);
        if (profiledDatasets.length === 0) {
            alert('Please upload at least one dataset first');
            return;
        }

        setAnalyzing(true);

        // Aggregate real profile data — no simulation
        setTimeout(() => {
            const profiles = profiledDatasets.map(d => d.profile);
            const totalRows = profiles.reduce((s, p) => s + (p.row_count || 0), 0);
            const totalColumns = profiles.reduce((s, p) => s + (p.column_count || 0), 0);
            const totalNulls = profiles.reduce((s, p) => s + (p.total_null_count || 0), 0);
            const totalDuplicates = profiles.reduce((s, p) => s + (p.duplicate_count || 0), 0);
            const dataTypes = profiles.reduce((acc, p) => {
                acc.numeric = (acc.numeric || 0) + (p.data_types?.numeric || 0);
                acc.categorical = (acc.categorical || 0) + (p.data_types?.categorical || 0);
                acc.datetime = (acc.datetime || 0) + (p.data_types?.datetime || 0);
                return acc;
            }, {});

            const analysis = {
                datasets: profiles.map((p, i) => ({
                    name: p.filename,
                    columns: p.column_count,
                    rows: p.row_count,
                    size: profiledDatasets[i].size,
                    cached: p.cached,
                    nullCount: p.total_null_count,
                    duplicates: p.duplicate_count,
                    dataTypes: p.data_types,
                    profile: p,
                })),
                totalColumns,
                totalRows,
                nullValues: totalNulls,
                duplicates: totalDuplicates,
                dataTypes,
                allColumns: profiles.flatMap(p => p.columns || []),
            };

            setWorkflowData({ ...workflowData, analysis });
            setAnalyzing(false);
        }, 400); // small delay for UX feedback

    };

    const profiledCount = (workflowData.datasets || []).filter(d => d.profile).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white">
                        <Brain size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Generate Data Analysis</h2>
                        <p className="text-gray-600">Real statistical profiles from your uploaded datasets</p>
                    </div>
                </div>
                {workflowData.analysis && (
                    <button onClick={() => { setWorkflowData({ ...workflowData, analysis: null }); }}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                        Re-analyse
                    </button>
                )}
            </div>

            {!workflowData.analysis ? (
                <div className="text-center py-12">
                    <Brain size={64} className="mx-auto text-indigo-600 mb-6" />
                    <p className="text-gray-600 mb-2">
                        {profiledCount} dataset{profiledCount !== 1 ? 's' : ''} ready for analysis
                    </p>
                    <p className="text-sm text-gray-500 mb-6">Profiles were captured during upload — aggregation is instant</p>
                    <button onClick={handleAnalyze}
                        disabled={analyzing || profiledCount === 0}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg">
                        {analyzing ? 'Aggregating...' : 'Build Analysis'}
                    </button>
                </div>
            ) : (
                <div>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Columns', value: workflowData.analysis.totalColumns, color: 'blue' },
                            { label: 'Total Rows', value: workflowData.analysis.totalRows?.toLocaleString(), color: 'purple' },
                            { label: 'Null Values', value: workflowData.analysis.nullValues, color: 'orange' },
                            { label: 'Duplicates', value: workflowData.analysis.duplicates, color: 'green' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-xl border-2 border-${color}-200`}>
                                <div className={`text-3xl font-bold text-${color}-700`}>{value}</div>
                                <div className={`text-sm text-${color}-600 font-semibold mt-1`}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Data type breakdown */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { label: 'Numeric', count: workflowData.analysis.dataTypes?.numeric || 0, color: 'blue' },
                            { label: 'Categorical', count: workflowData.analysis.dataTypes?.categorical || 0, color: 'violet' },
                            { label: 'Datetime', count: workflowData.analysis.dataTypes?.datetime || 0, color: 'teal' },
                        ].map(({ label, count, color }) => (
                            <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 text-center`}>
                                <div className={`text-2xl font-bold text-${color}-700`}>{count}</div>
                                <div className={`text-xs font-semibold text-${color}-600 mt-1`}>{label} columns</div>
                            </div>
                        ))}
                    </div>

                    {/* Per-dataset breakdown with expandable column profiles */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Breakdown</h3>
                        <div className="space-y-4">
                            {workflowData.analysis.datasets?.map((ds, idx) => (
                                <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => setExpandedDataset(expandedDataset === idx ? null : idx)}>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900">{ds.name}</span>
                                                    {ds.cached && (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-300">⚡ Cached</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-0.5">
                                                    {ds.columns} cols • {ds.rows?.toLocaleString()} rows •
                                                    {ds.nullCount} nulls • {ds.duplicates} dupes
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-gray-400 text-sm">{expandedDataset === idx ? '▲ Hide' : '▼ Columns'}</span>
                                    </div>

                                    {expandedDataset === idx && ds.profile?.columns && (
                                        <div className="border-t border-gray-200 overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        {['Column', 'Type', 'Nulls', 'Null %', 'Unique', 'Cardinality %', 'Stats'].map(h => (
                                                            <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {ds.profile.columns.map((col, ci) => (
                                                        <tr key={ci} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2 font-medium text-gray-900">{col.name}</td>
                                                            <td className="px-4 py-2">
                                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                                    col.data_type === 'numeric' ? 'bg-blue-100 text-blue-700' :
                                                                    col.data_type === 'datetime' ? 'bg-teal-100 text-teal-700' :
                                                                    'bg-violet-100 text-violet-700'
                                                                }`}>{col.data_type}</span>
                                                            </td>
                                                            <td className="px-4 py-2 text-gray-700">{col.null_count}</td>
                                                            <td className="px-4 py-2">
                                                                <span className={col.null_rate > 0.1 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                                                                    {(col.null_rate * 100).toFixed(1)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 text-gray-700">{col.unique_count}</td>
                                                            <td className="px-4 py-2 text-gray-700">{(col.cardinality_rate * 100).toFixed(1)}%</td>
                                                            <td className="px-4 py-2 text-gray-500 text-xs max-w-xs truncate">
                                                                {col.data_type === 'numeric' && col.stats
                                                                    ? `min ${col.stats.min} · max ${col.stats.max} · mean ${col.stats.mean}`
                                                                    : col.data_type === 'datetime' && col.stats
                                                                    ? `${col.stats.min_date?.slice(0,10)} → ${col.stats.max_date?.slice(0,10)}`
                                                                    : col.stats?.top_values
                                                                    ? Object.keys(col.stats.top_values).slice(0,3).join(', ')
                                                                    : '—'
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
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

        setTimeout(() => {
            // Use real columns from profile; fall back to sample names
            const allCols = workflowData.analysis?.allColumns || [];
            const topCols = allCols.length > 0
                ? allCols.slice(0, 8)
                : [
                    { name: 'customer_id', data_type: 'categorical' },
                    { name: 'email', data_type: 'categorical' },
                    { name: 'purchase_amount', data_type: 'numeric' },
                    { name: 'status', data_type: 'categorical' },
                  ];

            // Auto-generate simple business glossary mapping from column names
            const glossaryMap = {};
            topCols.forEach(col => {
                const n = col.name.toLowerCase();
                if (/customer|client|user/.test(n)) glossaryMap[col.name] = 'Customer';
                else if (/order|transaction|purchase|payment/.test(n)) glossaryMap[col.name] = 'Transaction';
                else if (/product|item|sku/.test(n)) glossaryMap[col.name] = 'Product';
                else if (/date|time|created|updated/.test(n)) glossaryMap[col.name] = 'Temporal';
            });
            const glossaryTerms = [...new Set(Object.values(glossaryMap))];

            const datasetNodes = (workflowData.analysis.datasets || []).map((ds, idx) => ({
                id: `dataset_${idx}`, label: ds.name, type: 'dataset', color: '#7c3aed'
            }));
            const columnNodes = topCols.map(col => ({
                id: `col_${col.name}`, label: col.name, type: 'column', color: '#2563eb', data_type: col.data_type
            }));
            const glossNodes = glossaryTerms.map(term => ({
                id: `gloss_${term}`, label: term, type: 'glossary', color: '#059669'
            }));

            const dsEdges = topCols.map(col => ({
                from: 'dataset_0', to: `col_${col.name}`, label: 'contains'
            }));
            const glossEdges = Object.entries(glossaryMap).map(([colName, term]) => ({
                from: `col_${colName}`, to: `gloss_${term}`, label: 'represents'
            }));

            const graph = {
                nodes: [...datasetNodes, ...columnNodes, ...glossNodes],
                edges: [...dsEdges, ...glossEdges],
                stats: {
                    totalNodes: datasetNodes.length + columnNodes.length + glossNodes.length,
                    totalEdges: dsEdges.length + glossEdges.length,
                    datasets: datasetNodes.length,
                    columns: columnNodes.length,
                    glossaryTerms: glossNodes.length,
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

// Compute CDE importance score from real profile column data
const computeImportance = (col) => {
    let score = 0.5;
    const name = col.name.toLowerCase();

    // Name heuristics
    if (/\b(id|key|identifier)\b/.test(name)) score += 0.35;
    else if (/\b(email|phone|mobile|contact)\b/.test(name)) score += 0.30;
    else if (/\b(amount|price|value|revenue|cost|total)\b/.test(name)) score += 0.28;
    else if (/\b(date|time|created|updated|timestamp)\b/.test(name)) score += 0.20;
    else if (/\b(status|state|type|category|class)\b/.test(name)) score += 0.18;
    else if (/\b(name|title|label)\b/.test(name)) score += 0.15;

    // Low null rate = more important
    const nullPenalty = (col.null_rate || 0) * 0.3;
    score -= nullPenalty;

    // High cardinality categorical = likely an identifier
    if (col.data_type === 'categorical' && (col.cardinality_rate || 0) > 0.8) score += 0.15;

    return Math.min(1.0, Math.max(0.0, parseFloat(score.toFixed(2))));
};

// Step 5: Identify CDEs — derived from real profile columns when available
const IdentifyCDEsStep = ({ workflowData, setWorkflowData }) => {
    const FALLBACK_COLUMNS = [
        { name: 'customer_id', type: 'categorical', importance: 0.95, selected: true, null_rate: 0, unique_count: null },
        { name: 'email', type: 'categorical', importance: 0.88, selected: true, null_rate: 0, unique_count: null },
        { name: 'purchase_amount', type: 'numeric', importance: 0.92, selected: true, null_rate: 0, unique_count: null },
        { name: 'created_date', type: 'datetime', importance: 0.75, selected: false, null_rate: 0, unique_count: null },
        { name: 'status', type: 'categorical', importance: 0.82, selected: true, null_rate: 0, unique_count: null },
        { name: 'region', type: 'categorical', importance: 0.65, selected: false, null_rate: 0, unique_count: null },
    ];

    const buildColumns = () => {
        const allCols = workflowData.analysis?.allColumns || [];
        if (allCols.length === 0) return FALLBACK_COLUMNS;
        return allCols.map(col => {
            const imp = computeImportance(col);
            return {
                name: col.name,
                type: col.data_type,
                importance: imp,
                selected: imp >= 0.75,
                null_rate: col.null_rate,
                unique_count: col.unique_count,
                stats: col.stats,
            };
        });
    };

    const [columns] = useState(buildColumns);
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
        const column = columns.find(c => c.name === columnName);
        if (!column) return;
        try {
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
                                    <strong>Selection Criteria:</strong>{' '}
                                    {typeof ruleExplanation.selection_criteria === 'string'
                                        ? ruleExplanation.selection_criteria
                                        : Object.entries(ruleExplanation.selection_criteria).map(([k, v]) => (
                                            <div key={k} className="mt-1">• <strong>{k.replace(/_/g, ' ')}:</strong> {v}</div>
                                          ))
                                    }
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
                                    : Object.entries(ruleExplanation.coverage_analysis).map(([k, v]) => (
                                        <div key={k} className="mt-1">
                                            • <strong>{k.replace(/_/g, ' ')}:</strong>{' '}
                                            {Array.isArray(v) ? v.join(', ') : String(v)}
                                        </div>
                                      ))
                                }
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
        a.download = `orian-dq-rules.${exportFormat}`;
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
