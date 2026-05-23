import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  TrendingUp, 
  ShieldCheck 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="sidebar-logo">
        <TrendingUp className="sidebar-logo-icon" />
        <span>Mini CRM</span>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-menu">
        <NavLink 
          to="/" 
          className={({ isActive }) => `sidebar-item-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        {/* We can have other routes if needed, but since it's a SPA with single central table dashboard + details, this is perfect */}
      </nav>

      {/* Footer / User Profile & Logout */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.username}</span>
              <span className="sidebar-user-role">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={12} /> Admin
                </span>
              </span>
            </div>
          </div>
        )}
        
        <button className="btn btn-secondary btn-full" onClick={handleLogoutClick}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
