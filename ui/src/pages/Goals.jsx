import React, { useState, useEffect } from 'react';
import { Plus, Save } from 'lucide-react';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newGoal, setNewGoal] = useState({ goal_id: '', kpis: {}, dod_threshold: 0.95 });
    const [kpiInput, setKpiInput] = useState('');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await fetch('/goals');
            if (res.ok) setGoals(await res.json());
        } catch (err) { console.error(err); }
    };

    const handleSave = async () => {
        // Parse KPI input "metric:value"
        const kpis = {};
        if (kpiInput) {
            const [key, val] = kpiInput.split(':');
            if (key && val) kpis[key.trim()] = parseFloat(val);
        }

        const payload = { ...newGoal, target_kpis: kpis };

        await fetch('/goal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        setIsCreating(false);
        fetchGoals();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Goals & Definitions of Done</h2>
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
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Goal ID</label>
                            <input
                                type="text"
                                placeholder="urn:goal:..."
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newGoal.goal_id}
                                onChange={e => setNewGoal({ ...newGoal, goal_id: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">DoD Threshold (0-1)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newGoal.dod_threshold}
                                onChange={e => setNewGoal({ ...newGoal, dod_threshold: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">KPI (metric:value)</label>
                            <input
                                type="text"
                                placeholder="f1_score:0.85"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={kpiInput}
                                onChange={e => setKpiInput(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            <Save size={18} /> Save Goal
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
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
        </div>
    );
};

export default Goals;
