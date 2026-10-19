
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import './App.css';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

import Home from './Home';
import Tasks from './Tasks';
import Auth from './Auth';

// Lazy-loaded route components
const Projects = lazy(() => import('./Projects'));
const Contact = lazy(() => import('./Contact'));

const API = 'http://localhost:3000';

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        if (active) setCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch(`${API}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          localStorage.removeItem('auth_token');
          if (active) setUser(null);
        } else {
          const data = await response.json();
          if (active) setUser(data);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setCheckingAuth(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    navigate('/tasks', { replace: true });
  };

  const sections = ['Home', 'Projects', 'Tasks', 'Contact'];

  if (checkingAuth) {
    return <div className="app-shell">Checking login...</div>;
  }

  return (
    <div className="app-shell">
      <Header name="Poojan Bhadani" themeColor="#0f172a" />
      <NavBar sections={sections} />

      <main className="main-content">
        <Suspense
          fallback={
            <div className="route-page" role="status">
              Loading page...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />

            <Route
              path="/login"
              element={
                user
                  ? <Navigate to="/tasks" replace />
                  : <Auth onLogin={handleLogin} />
              }
            />

            <Route
              path="/tasks"
              element={
                user
                  ? <Tasks onLogout={logout} />
                  : <Navigate to="/login" replace />
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
