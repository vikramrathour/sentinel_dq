import React, { useState, useEffect, useCallback } from 'react';
import { History, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const Ledger = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadLogs = useCallback(() => {
        setLoading(true);
        setError(null);
        fetch('/ledger')
            .then(res => {
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setLogs(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load audit records.');
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <History className="text-blue-600" size={32} />
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">Inference Ledger</h2>
                        {!loading && !error && logs.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {logs.length} records
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500">Immutable audit log of all automated trust decisions.</p>
                </div>
            </div>

            {loading && (
                <div
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    role="status"
                    aria-label="Loading audit records"
                >
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {['Timestamp', 'Goal ID', 'Dataset', 'Quality Score', 'Status'].map(col => (
                                    <th key={col} scope="col" className="px-6 py-4 font-semibold text-gray-600">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><div className="bg-gray-200 rounded animate-pulse h-4 w-32" /></td>
                                    <td className="px-6 py-4"><div className="bg-gray-200 rounded animate-pulse h-4 w-40" /></td>
                                    <td className="px-6 py-4"><div className="bg-gray-200 rounded animate-pulse h-4 w-36" /></td>
                                    <td className="px-6 py-4"><div className="bg-gray-200 rounded animate-pulse h-4 w-16" /></td>
                                    <td className="px-6 py-4"><div className="bg-gray-200 rounded animate-pulse h-4 w-20" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && error && (
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="text-red-500" size={40} />
                    <p className="text-gray-700 font-medium">{error}</p>
                    <button
                        onClick={loadLogs}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left" aria-label="Inference audit ledger">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold text-gray-600">Timestamp</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-gray-600">Goal ID</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-gray-600">Dataset</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-gray-600">Quality Score</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map((log, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                        {new Date(log['prov:startedAtTime']).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate" title={log['meta:aiGoal']}>
                                        {log['meta:aiGoal']}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={log['dcat:dataset']}>
                                        {log['dcat:dataset']}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="font-bold">
                                            {(log['dqv:hasQualityMeasurement']['dqv:value'] * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log['meta:trustStatus'] ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                <CheckCircle size={14} /> TRUSTED
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                <XCircle size={14} /> FAILED
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.length === 0 && (
                        <div className="p-12 flex flex-col items-center gap-3 text-center">
                            <History className="text-gray-300" size={48} />
                            <p className="font-semibold text-gray-700">No inference records yet</p>
                            <p className="text-sm text-gray-500">Quality gate verifications will appear here</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Ledger;
