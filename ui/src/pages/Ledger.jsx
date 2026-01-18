import React, { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle } from 'lucide-react';

const Ledger = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetch('/ledger').then(res => res.json()).then(setLogs);
    }, []);

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <History className="text-blue-600" size={32} />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Inference Ledger</h2>
                    <p className="text-gray-500">Immutable audit log of all automated trust decisions.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Timestamp</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Goal ID</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Dataset</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Quality Score</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
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
                    <div className="p-8 text-center text-gray-500">No inference records found.</div>
                )}
            </div>
        </div>
    );
};

export default Ledger;
