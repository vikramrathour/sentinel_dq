import React, { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingUp, AlertCircle, CheckCircle, Database, Network, RefreshCw } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(() => {
        setLoading(true);
        setError(null);
        fetch('/v1/dashboard')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load dashboard data. Please try again.');
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <div className="space-y-6" role="status" aria-live="polite">
                {/* Skeleton Header */}
                <div>
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Skeleton Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>

                {/* Skeleton Heatmap */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="mb-6">
                        <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
                <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
                <h2 className="font-bold text-gray-900 text-lg mb-2">Unable to load dashboard</h2>
                <p className="text-gray-600 text-sm mb-6">{error}</p>
                <button
                    onClick={loadData}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition"
                >
                    <RefreshCw size={16} />
                    Retry
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
                <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
                <h2 className="font-bold text-gray-900 text-lg mb-2">Unable to load dashboard</h2>
                <p className="text-gray-600 text-sm mb-6">No data available. Please try again.</p>
                <button
                    onClick={loadData}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition"
                >
                    <RefreshCw size={16} />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Quality Dashboard</h1>
                <p className="text-gray-600">Real-time monitoring of your data trust ecosystem</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Datasets"
                    value={data.summary?.total_datasets || 0}
                    icon={Database}
                    color="from-blue-600 to-blue-700"
                    trend="+12%"
                />
                <MetricCard
                    title="Monitored Nodes"
                    value={data.summary?.total_nodes || 0}
                    icon={Network}
                    color="from-purple-600 to-purple-700"
                    trend="+8%"
                />
                <MetricCard
                    title="Dependencies"
                    value={data.summary?.total_dependencies || 0}
                    icon={Activity}
                    color="from-indigo-600 to-indigo-700"
                    trend="+5%"
                />
                <MetricCard
                    title="Health Score"
                    value="94%"
                    icon={CheckCircle}
                    color="from-green-600 to-green-700"
                    trend="+2%"
                />
            </div>

            {/* Trust Heatmap */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Trust Heatmap</h2>
                        <p className="text-sm text-gray-600">Visual representation of data quality across nodes</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Last updated: Just now</span>
                    </div>
                </div>

                {/* Heatmap Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {data.heatmap?.nodes.map(node => (
                        <NodeCard key={node.id} node={node} />
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500"></div>
                            <span className="text-gray-600">Excellent (&gt;90%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-yellow-500"></div>
                            <span className="text-gray-600">Good (70-90%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-500"></div>
                            <span className="text-gray-600">Needs Attention (&lt;70%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Quality Checks</h2>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="text-green-600" size={20} />
                                <div>
                                    <div className="font-semibold text-gray-900">Quality check passed</div>
                                    <div className="text-sm text-gray-600">Dataset: customer_data_{i}</div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {i} min ago
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, color, trend }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
                <div
                    aria-hidden="true"
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}
                >
                    <Icon size={24} className="text-white" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                        <TrendingUp size={16} />
                        {trend}
                    </div>
                )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-600">{title}</div>
        </div>
    );
};

const NodeCard = ({ node }) => {
    const getHealthColor = (health) => {
        if (health > 0.9) return 'from-green-500 to-green-600 border-green-300';
        if (health > 0.7) return 'from-yellow-500 to-yellow-600 border-yellow-300';
        return 'from-red-500 to-red-600 border-red-300';
    };

    const getHealthBg = (health) => {
        if (health > 0.9) return 'bg-green-50';
        if (health > 0.7) return 'bg-yellow-50';
        return 'bg-red-50';
    };

    return (
        <div className={`${getHealthBg(node.health)} border-2 rounded-lg p-4 hover:shadow-md transition cursor-pointer`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate" title={node.id}>
                        {node.id}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{node.type}</div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Health</span>
                <span className="text-lg font-bold text-gray-900">
                    {(node.health * 100).toFixed(0)}%
                </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`bg-gradient-to-r ${getHealthColor(node.health)} h-2 rounded-full transition-all`}
                    style={{ width: `${node.health * 100}%` }}
                />
            </div>
        </div>
    );
};

export default Dashboard;
