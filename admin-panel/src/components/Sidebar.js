import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/professionals', label: 'Profissionais' },
  { to: '/users', label: 'Usuários' },
  { to: '/services', label: 'Serviços' },
  { to: '/reviews', label: 'Avaliações' },
];

const Sidebar = ({ onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">SeuServiço Admin</div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="logout-btn" onClick={onLogout}>
        Sair
      </button>
    </aside>
  );
};

export default Sidebar;
