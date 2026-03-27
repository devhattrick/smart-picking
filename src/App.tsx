import { useEffect, useEffectEvent, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Inbound from './pages/Inbound';
import Outbound from './pages/Outbound';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Errorpage from './pages/Errorpage';
import {
  AUTH_UNAUTHORIZED_EVENT,
  PickingSystemServiceError,
  getStoredAuthSession,
  pickingSystemService,
} from './services/picking-system-service';
import type { MovementLog, Product, User } from './types';

const getStoredUser = (): User | null => {
  return getStoredAuthSession()?.user ?? null;
};

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<MovementLog[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [initialDataError, setInitialDataError] = useState<string | null>(null);

  const loadAppData = useEffectEvent(async () => {
    if (!user) {
      setProducts([]);
      setHistory([]);
      setLocations([]);
      setInitialDataError(null);
      setIsLoadingInitialData(false);
      return;
    }

    setIsLoadingInitialData(true);
    setInitialDataError(null);

    try {
      const data = await pickingSystemService.getInitialData();
      setProducts(data.products);
      setHistory(data.history);
      setLocations(data.locations);
    } catch (error) {
      if (error instanceof PickingSystemServiceError && error.status === 401) {
        setUser(null);
        setProducts([]);
        setHistory([]);
        setLocations([]);
        setIsLoadingInitialData(false);
        return;
      }

      setInitialDataError(error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลจาก API ได้');
    } finally {
      setIsLoadingInitialData(false);
    }
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setProducts([]);
      setHistory([]);
      setLocations([]);
      setInitialDataError(null);
      setIsLoadingInitialData(false);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  useEffect(() => {
    void loadAppData();
  }, [user]);

  return (
    <BrowserRouter basename={routerBase}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} />
        <Route path="/error" element={<Errorpage />} />

        <Route
          element={
            user ? (
              <Layout
                products={products}
                setProducts={setProducts}
                history={history}
                setHistory={setHistory}
                locations={locations}
                setLocations={setLocations}
                user={user}
                setUser={setUser}
                appDataStatus={{
                  isLoadingInitialData,
                  initialDataError,
                  reloadAppData: loadAppData,
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={user?.role === 'admin' ? <Home /> : <Navigate to="/dashboard" replace />} />
          <Route path="/inbound" element={<Inbound />} />
          <Route path="/outbound" element={<Outbound />} />
          <Route path="/history" element={<History />} />
        </Route>

        <Route path="*" element={<Errorpage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
