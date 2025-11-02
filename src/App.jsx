// src/App.jsx
import { Suspense, lazy } from 'react'; // Importa Suspense e lazy
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import Layout from './features/layout/components/Layout';
import Loading from './shared/components/Loading'; 

const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));

// Páginas Protegidas (dentro do layout)
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const CampaignsPage = lazy(() => import('./features/campaigns/pages/CampaignsPage'));
const ClientsPage = lazy(() => import('./features/clients/pages/ClientsPage'));
const AlertsPage = lazy(() => import('./features/alerts/pages/AlertsPage'));
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage'));

function App() {
  return (
    <Router>
      {/* Suspense é necessário para "segurar" a renderização
        enquanto o código da página (lazy-loaded) é baixado.
      */}
      <Suspense fallback={<Loading text="Carregando..." size="lg" />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Rotas filhas que serão renderizadas dentro do <Layout /> */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Redireciona qualquer rota não encontrada para o dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;