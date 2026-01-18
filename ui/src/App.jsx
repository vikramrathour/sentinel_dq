import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TrustHeatmap from './TrustHeatmap';
import Goals from './pages/Goals';
import Verify from './pages/Verify';
import Ledger from './pages/Ledger';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<TrustHeatmap />} />
                    <Route path="goals" element={<Goals />} />
                    <Route path="verify" element={<Verify />} />
                    <Route path="ledger" element={<Ledger />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
