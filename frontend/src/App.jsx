import { Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorAuth, useAuth } from './context/AuthContext';
import Disposicion from './components/layout/Layout';
import PaginaLogin from './pages/auth/LoginPage';
import PaginaDashboard from './pages/DashboardPage';
import PaginaArticulos from './pages/ArticlesPage';
import PaginaVentas from './pages/SalesPage';
import PaginaSugerencias from './pages/SuggestionsPage';
import PaginaListaCompras from './pages/admin/PurchaseListPage';
import PaginaReportes from './pages/admin/ReportsPage';
import PaginaUsuarios from './pages/admin/UsersPage';
import PaginaCrearUsuario from './pages/admin/CreateUserPage';
import PaginaRegistroAccesos from './pages/admin/AccessLogsPage';
import PaginaEstadoInventario from './pages/seller/StatusPage';

function RutaPrivada({ children, soloAdmin = false }) {
  const { usuario, esAdmin } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (soloAdmin && !esAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function RutasApp() {
  const { usuario } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/dashboard" replace /> : <PaginaLogin />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<RutaPrivada><Disposicion /></RutaPrivada>}>
        <Route path="/dashboard"    element={<PaginaDashboard />} />
        <Route path="/articles"     element={<PaginaArticulos />} />
        <Route path="/sales"        element={<PaginaVentas />} />
        <Route path="/suggestions"  element={<PaginaSugerencias />} />
        <Route path="/status"       element={<PaginaEstadoInventario />} />
        <Route path="/purchase-list" element={<RutaPrivada soloAdmin><PaginaListaCompras /></RutaPrivada>} />
        <Route path="/reports"       element={<RutaPrivada soloAdmin><PaginaReportes /></RutaPrivada>} />
        <Route path="/users"         element={<RutaPrivada soloAdmin><PaginaUsuarios /></RutaPrivada>} />
        <Route path="/create-user"   element={<RutaPrivada soloAdmin><PaginaCrearUsuario /></RutaPrivada>} />
        <Route path="/access-logs"   element={<RutaPrivada soloAdmin><PaginaRegistroAccesos /></RutaPrivada>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ProveedorAuth>
      <RutasApp />
    </ProveedorAuth>
  );
}
