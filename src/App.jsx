// src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Inbound from './pages/Inbound';
import Outbound from './pages/Outbound';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { initialProducts, initialHistory } from './data/mockData';

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [history, setHistory] = useState(initialHistory);

  const storedUser = localStorage.getItem('user');
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} />

        <Route path="/" element={user ? <Layout products={products} setProducts={setProducts} history={history} setHistory={setHistory} user={user} setUser={setUser} /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={user?.role === 'admin' ? <Home /> : <Navigate to="/dashboard" replace />} />
          <Route path="inbound" element={<Inbound />} />
          <Route path="outbound" element={<Outbound />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;