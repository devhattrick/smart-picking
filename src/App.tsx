// src/App.tsx
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
import type { User } from './types';

const getStoredUser = (): User | null => {
  const rawUser = localStorage.getItem('user');
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
};

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [history, setHistory] = useState(initialHistory);
  const [user, setUser] = useState<User | null>(getStoredUser);

  return (
    <BrowserRouter basename={routerBase}>
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
