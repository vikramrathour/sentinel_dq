import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Target, ShieldCheck, History } from 'lucide-react';

const Layout = () => {
    const navItems = [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/goals', label: 'AI Goals', icon: Target },
        { path: '/verify', label: 'Quality Gate', icon: ShieldCheck },
        { path: '/ledger', label: 'Audit Ledger', icon: History },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-2xl font-bold tracking-tight text-blue-400">Sentinel-DQ</h1>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Autonomous Trust Engine</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
                    v1.0.0 • Connected
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white shadow h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-gray-700">Enterprise Data Quality Platform</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm font-medium text-gray-600">System Active</span>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
