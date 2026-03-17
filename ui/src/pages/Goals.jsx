import React, { useState, useEffect } from 'react';
import { Plus, Save, RefreshCw, AlertCircle, Loader2, Target } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Goals = () => {
    const { showToast } = useToast();
    const [goals, setGoals] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newGoal, setNewGoal] = useState({ goal_id: '', kpis: {}, dod_threshold: 0.95 });
    const [kpiInput, setKpiInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadGoals(); }, []);

    const loadGoals = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/goals');
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            setGoals(await res.json());
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!newGoal.goal_id.trim()) {
            showToast({ message: 'Goal ID is required', type: 'warning' });
            return;
        }

        const kpis = {};
        if (kpiInput) {
            const [key, val] = kpiInput.split(':');
            if (key && val) kpis[key.trim()] = parseFloat(val);
        }
        const payload = { ...newGoal, target_kpis: kpis };

        setSaving(true);
        try {
            const res = await fetch('/goal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            showToast({ message: 'Goal saved successfully', type: 'success' });
            setIsCreating(false);
            setNewGoal({ goal_id: '', kpis: {}, dod_threshold: 0.95 });
            setKpiInput('');
            loadGoals();
        } catch (err) {
            console.error(err);
            showToast({ message: 'Failed to save goal', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const SkeletonCards = () => (
        <>
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-gray-200 rounded-full h-6 w-24 animate-pulse" />
                        <div className="bg-gray-200 rounded h-8 w-12 animate-pulse" />
                    </div>
                    <div className="bg-gray-200 rounded h-5 w-3/4 mb-2 animate-pulse" />
                    <div className="bg-gray-200 rounded h-4 w-1/2 mb-4 animate-pulse" />
                    <div className="bg-gray-50 p-3 rounded space-y-2">
                        <div className="flex justify-between">
                            <div className="bg-gray-200 rounded h-4 w-24 animate-pulse" />
                            <div className="bg-gray-200 rounded h-4 w-10 animate-pulse" />
                        </div>
                        <div className="flex justify-between">
                            <div className="bg-gray-200 rounded h-4 w-20 animate-pulse" />
                            <div className="bg-gray-200 rounded h-4 w-10 animate-pulse" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Goals &amp; Definitions of Done</h2>
                    <p className="text-gray-500">Manage quality thresholds for your AI initiatives.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md transition"
                >
                    <Plus size={18} /> New Goal
                </button>
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-semibold mb-4">Define New Goal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor="goal-id" className="block text-sm font-medium text-gray-700 mb-1">Goal ID</label>
                            <input
                                id="goal-id"
                                type="text"
                                placeholder="urn:goal:..."
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newGoal.goal_id}
                                onChange={e => setNewGoal({ ...newGoal, goal_id: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="dod-threshold" className="block text-sm font-medium text-gray-700 mb-1">DoD Threshold (0-1)</label>
                            <input
                                id="dod-threshold"
                                type="number"
                                step="0.01"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newGoal.dod_threshold}
                                onChange={e => setNewGoal({ ...newGoal, dod_threshold: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label htmlFor="kpi-input" className="block text-sm font-medium text-gray-700 mb-1">KPI (metric:value)</label>
                            <input
                                id="kpi-input"
                                type="text"
                                placeholder="f1_score:0.85"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={kpiInput}
                                onChange={e => setKpiInput(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />}
                            Save Goal
                        </button>
                    </div>
                </div>
            )}

            {/* Content area: loading / error / empty / list */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SkeletonCards />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="text-red-400 mb-3" size={40} />
                    <p className="text-gray-600 font-medium mb-1">Failed to load goals</p>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={loadGoals}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <RefreshCw size={16} /> Retry
                    </button>
                </div>
            ) : goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
                    <Target className="text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500 font-medium mb-1">No goals yet.</p>
                    <p className="text-gray-400 text-sm mb-4">Create your first quality goal.</p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md transition"
                    >
                        <Plus size={18} /> New Goal
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => (
                        <div key={goal.goal_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                    Active Goal
                                </div>
                                <span className="text-2xl font-bold text-gray-900">
                                    {(goal.dod_threshold * 100).toFixed(0)}%
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1 truncate" title={goal.goal_id}>
                                {goal.goal_id}
                            </h3>
                            <div className="text-sm text-gray-500 mb-4">Target KPIs defined</div>
                            <div className="bg-gray-50 p-3 rounded text-sm">
                                {Object.entries(goal.target_kpis).map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                        <span className="font-mono text-gray-600">{k}</span>
                                        <span className="font-semibold">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Goals;
