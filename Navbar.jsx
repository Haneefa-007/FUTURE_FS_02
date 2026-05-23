import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon } from 'lucide-react';

const Navbar = ({ title = 'Dashboard' }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const { logout } = useContext(AuthContext);

  // Apply dark mode styling class to root element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>
      
      <div className="navbar-actions">
        {/* Demo Logout Button */}
        <button className="btn btn-ghost btn-sm" onClick={() => logout()} style={{ marginLeft: '1rem' }}>Logout</button>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={20} style={{ color: '#fbbf24' }} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
