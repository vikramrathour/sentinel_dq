import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Workflow as WorkflowIcon, LayoutDashboard, Target, ShieldCheck, History, Sparkles, Menu, X } from 'lucide-react';

const Layout = () => {
    const location = useLocation();
    const isWorkflowPage = location.pathname === '/';
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Workflow', icon: WorkflowIcon },
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/goals', label: 'AI Goals', icon: Target },
        { path: '/verify', label: 'Quality Gate', icon: ShieldCheck },
        { path: '/ledger', label: 'Audit Ledger', icon: History },
    ];

    // If on workflow page, render without sidebar
    if (isWorkflowPage) {
        return <Outlet />;
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-gray-900">
            {/* Mobile overlay backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:relative inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#1a1f3a] to-[#2d3561] text-white flex flex-col shadow-2xl transform transition-transform duration-300 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                <div className="p-6 border-b border-blue-800/30">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Sparkles size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold tracking-tight">OrianDQ</h1>
                        </div>
                        {/* Close button — mobile only */}
                        <button
                            className="md:hidden text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close navigation"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-xs text-blue-200 uppercase tracking-widest">Powered by Xoriant ORIAN</p>
                </div>

                <nav className="flex-1 p-4 space-y-2" aria-label="Main navigation">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium
                                ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'text-blue-100 hover:bg-white/10 hover:text-white'}
                            `}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 border-t border-blue-800/30">
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-xs font-semibold text-green-300">System Active</span>
                        </div>
                        <div className="text-xs text-blue-200">
                            v1.0.0 • Enterprise Edition
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        {/* Hamburger button — mobile only */}
                        <button
                            className="md:hidden text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Menu size={22} />
                        </button>
                        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                            Autonomous Data Quality Platform
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-xs text-gray-500">
                            © 2026 Xoriant Corporation
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
