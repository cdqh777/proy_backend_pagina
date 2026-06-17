import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Lightbulb,
  ClipboardList, BarChart2, Users, FileText, LogOut,
  Menu, BookOpen, Activity, UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';

const navegacionAdmin = [
  { hacia: '/dashboard',     icono: LayoutDashboard, etiqueta: 'Dashboard' },
  { hacia: '/articles',      icono: Package,         etiqueta: 'Artículos' },
  { hacia: '/sales',         icono: ShoppingCart,    etiqueta: 'Ventas' },
  { hacia: '/status',        icono: Activity,        etiqueta: 'Estado inventario' },
  { hacia: '/suggestions',   icono: Lightbulb,       etiqueta: 'Sugerencias' },
  { hacia: '/purchase-list', icono: ClipboardList,   etiqueta: 'Lista de compras' },
  { hacia: '/reports',       icono: BarChart2,       etiqueta: 'Reportes' },
  { hacia: '/users',         icono: Users,           etiqueta: 'Usuarios' },
  { hacia: '/create-user',   icono: UserPlus,        etiqueta: 'Crear usuario' },
  { hacia: '/access-logs',   icono: FileText,        etiqueta: 'Accesos' },
];

const navegacionVendedor = [
  { hacia: '/dashboard',   icono: LayoutDashboard, etiqueta: 'Dashboard' },
  { hacia: '/articles',    icono: Package,         etiqueta: 'Artículos' },
  { hacia: '/sales',       icono: ShoppingCart,    etiqueta: 'Ventas' },
  { hacia: '/status',      icono: Activity,        etiqueta: 'Estado inventario' },
  { hacia: '/suggestions', icono: Lightbulb,       etiqueta: 'Sugerencias' },
];

export default function Disposicion() {
  const { usuario, cerrarSesion, esAdmin } = useAuth();
  const navegar = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const elementosNav = esAdmin ? navegacionAdmin : navegacionVendedor;

  const manejarCierreSesion = async () => {
    await cerrarSesion();
    toast.success('Sesión cerrada');
    navegar('/login');
  };

  const BarraLateral = () => (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BookOpen size={22} />
        <span>Librería</span>
      </div>
      <nav className="sidebar-nav">
        {elementosNav.map(({ hacia, icono: Icono, etiqueta }) => (
          <NavLink
            key={hacia}
            to={hacia}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={() => setMenuAbierto(false)}
          >
            <Icono size={17} />
            <span>{etiqueta}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{usuario?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="sidebar-user-name">{usuario?.name}</div>
            <div className="sidebar-user-role">{usuario?.role}</div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={manejarCierreSesion}>
          <LogOut size={14} /> Salir
        </button>
      </div>
      <style>{estilosBarraLateral}</style>
    </aside>
  );

  return (
    <div className="app-layout">
      <BarraLateral />
      {menuAbierto && (
        <div className="mobile-overlay" onClick={() => setMenuAbierto(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <BarraLateral />
          </div>
        </div>
      )}
      <div className="main-area">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMenuAbierto(true)}>
            <Menu size={22} />
          </button>
          <span className="topbar-title">Sistema de Inventario</span>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      <style>{estilosDisposicion}</style>
    </div>
  );
}

const estilosBarraLateral = `
.sidebar {
  width: 240px; min-width: 240px;
  background: var(--espresso); color: var(--white);
  display: flex; flex-direction: column;
  height: 100vh; position: sticky; top: 0; overflow-y: auto;
}
.sidebar-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 22px 20px 18px;
  font-family: var(--font-display); font-size: 20px;
  border-bottom: 1px solid rgba(204,180,153,0.2);
}
.sidebar-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }
.sidebar-link {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-sm);
  font-size: 14px; color: rgba(255,255,255,0.72); transition: all 0.15s;
}
.sidebar-link:hover { background: rgba(204,180,153,0.12); color: var(--white); }
.sidebar-link.active { background: var(--brown); color: var(--white); }
.sidebar-footer {
  padding: 16px; border-top: 1px solid rgba(204,180,153,0.2);
  display: flex; flex-direction: column; gap: 12px;
}
.sidebar-user { display: flex; align-items: center; gap: 10px; }
.sidebar-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--brown); display: flex; align-items: center;
  justify-content: center; font-weight: 700; font-size: 15px; flex-shrink: 0;
}
.sidebar-user-name { font-size: 13px; font-weight: 600; }
.sidebar-user-role { font-size: 11px; color: var(--sand); text-transform: capitalize; }
`;

const estilosDisposicion = `
.app-layout { display: flex; min-height: 100vh; }
.main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.topbar {
  background: var(--white); border-bottom: 1px solid #e8e0d8;
  padding: 14px 24px; display: flex; align-items: center; gap: 14px;
  position: sticky; top: 0; z-index: 100;
}
.topbar-title { font-size: 15px; font-weight: 600; color: var(--tan); }
.page-content { padding: 28px; flex: 1; }
.mobile-menu-btn { display: none; background: none; border: none; color: var(--espresso); padding: 4px; }
.mobile-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); z-index: 200;
}
.mobile-sidebar .sidebar { position: relative; height: 100vh; }
@media (max-width: 768px) {
  .sidebar { display: none; }
  .mobile-menu-btn { display: block; }
  .mobile-overlay { display: flex; }
  .page-content { padding: 16px; }
}
`;
