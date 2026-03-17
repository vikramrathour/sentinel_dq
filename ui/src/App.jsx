import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Workflow from './pages/Workflow';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Verify from './pages/Verify';
import Ledger from './pages/Ledger';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <ErrorBoundary>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Workflow />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="goals" element={<Goals />} />
                            <Route path="verify" element={<Verify />} />
                            <Route path="ledger" element={<Ledger />} />
                        </Route>
                    </Routes>
                </ErrorBoundary>
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;
