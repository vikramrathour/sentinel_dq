import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

const Verify = () => {
    const [goals, setGoals] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState('');
    const [datasetId, setDatasetId] = useState('urn:dataset:demo');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/goals').then(res => res.json()).then(data => {
            setGoals(data);
            if (data.length > 0) setSelectedGoal(data[0].goal_id);
        });
    }, []);

    const handleVerify = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataset_id: datasetId, goal_id: selectedGoal })
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="text-blue-600" size={32} />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quality Gate Verification</h2>
                    <p className="text-gray-500">Run Decision-Impact checks to issue Trust Certificates.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="font-semibold text-lg mb-6">Configuration</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Dataset</label>
                            <input
                                type="text"
                                value={datasetId}
                                onChange={(e) => setDatasetId(e.target.value)}
                                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">AI Goal (Definition of Done)</label>
                            <select
                                value={selectedGoal}
                                onChange={(e) => setSelectedGoal(e.target.value)}
                                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                {goals.map(g => (
                                    <option key={g.goal_id} value={g.goal_id}>
                                        {g.goal_id} (Target: {g.dod_threshold})
                                    </option>
                                ))}
                            </select>
                            {goals.length === 0 && <div className="text-xs text-orange-500 mt-1">No goals found. Create one first.</div>}
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={loading || !selectedGoal}
                            className="w-full mt-4 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 disabled:bg-gray-300"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                            Withstand Quality Gate
                        </button>
                    </div>
                </div>

                {/* Result Panel */}
                <div>
                    {result ? (
                        <div className={`p-6 rounded-xl border-2 ${result.trusted ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} animate-in fade-in zoom-in-95`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-xl font-bold ${result.trusted ? 'text-green-800' : 'text-red-800'}`}>
                                    {result.trusted ? 'TRUST CERTIFICATE ISSUED' : 'VERIFICATION FAILED'}
                                </h3>
                                <div className="text-3xl font-black opacity-30">
                                    {(result.trust_score * 100).toFixed(1)}
                                </div>
                            </div>

                            <div className="bg-white/50 rounded-lg p-4 mb-4">
                                <div className="text-sm font-medium text-gray-600">Decision Impact Logic</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Quality Score ({result.trust_score.toFixed(4)}) vs Target DoD
                                </div>
                            </div>

                            <pre className="text-xs bg-white p-4 rounded-lg overflow-auto max-h-96 shadow-inner font-mono">
                                {JSON.stringify(result.dqv_record, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl min-h-[300px]">
                            <ShieldCheck size={48} className="mb-2 opacity-20" />
                            <p>Run verification to see results</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Verify;
