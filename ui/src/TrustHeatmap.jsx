import React, { useState, useEffect } from 'react';

const TrustHeatmap = () => {
    const [data, setData] = useState(null);
    const [goalId, setGoalId] = useState('');
    const [verifyResult, setVerifyResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/v1/dashboard')
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    const handleVerify = async () => {
        setLoading(true);
        try {
            const res = await fetch('/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dataset_id: 'urn:dataset:demo',
                    goal_id: goalId
                })
            });
            const result = await res.json();
            setVerifyResult(result);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    if (!data) return <div>Loading Heatmap...</div>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Sentinel-DQ Trust Heatmap</h2>

            {/* Summary Stats */}
            <div className="flex gap-4 mb-6">
                <div className="p-4 bg-gray-100 rounded">
                    <div className="text-2xl font-bold">{data.summary?.total_nodes}</div>
                    <div className="text-gray-600">Total Nodes</div>
                </div>
                <div className="p-4 bg-gray-100 rounded">
                    <div className="text-2xl font-bold">{data.summary?.total_dependencies}</div>
                    <div className="text-gray-600">Dependencies</div>
                </div>
            </div>

            {/* Heatmap Visualization (Mock Grid) */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {data.heatmap?.nodes.map(node => (
                    <div
                        key={node.id}
                        className={`p-4 rounded border-2 ${node.health > 0.9 ? 'border-green-500 bg-green-50' :
                                node.health > 0.7 ? 'border-yellow-500 bg-yellow-50' :
                                    'border-red-500 bg-red-50'
                            }`}
                    >
                        <div className="font-semibold">{node.id}</div>
                        <div className="text-sm text-gray-500">{node.type}</div>
                        <div className="text-right font-mono mt-2">
                            {(node.health * 100).toFixed(1)}%
                        </div>
                    </div>
                ))}
            </div>

            {/* Verification Panel */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Quality Gate Verification</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={goalId}
                        onChange={(e) => setGoalId(e.target.value)}
                        placeholder="Enter AI Goal ID"
                        className="border p-2 rounded"
                    />
                    <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {loading ? 'Verifying...' : 'Verify Trust Certificate'}
                    </button>
                </div>

                {verifyResult && (
                    <div className={`mt-4 p-4 rounded ${verifyResult.trusted ? 'bg-green-100' : 'bg-red-100'}`}>
                        <div className="font-bold text-lg">
                            Status: {verifyResult.trusted ? 'TRUSTED ✅' : 'UNTRUSTED ❌'}
                        </div>
                        <div>Trust Score: {verifyResult.trust_score?.toFixed(3)}</div>
                        <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto">
                            {JSON.stringify(verifyResult.dqv_record, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrustHeatmap;
