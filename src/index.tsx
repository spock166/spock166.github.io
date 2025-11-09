import React, { useState, useEffect, useRef } from 'react';
import './Styles/shared.css';
import './Styles/index.css';
import './Styles/navbar.css';
import ReactDOM from 'react-dom/client';
import { Routes, Route, HashRouter, Link, useLocation } from 'react-router-dom';

import Home from './Pages/Home';
import Serika from './Pages/Serika';
import Diffy  from './Pages/Diffy';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open on mobile
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className='header' ref={menuRef}>
      <Link to='/' className="logo">KDM</Link>

      <button 
        className={`hamb ${isMenuOpen ? 'open' : ''}`} 
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
      >
        <span className='hamb-line'></span>
      </button>

      <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
        <ul className='menu'>
          <li>
            <Link to='/' onClick={closeMenu}>Home</Link>
          </li>
          <li>
            <Link to='/serika' onClick={closeMenu}>Serika</Link>
          </li>
          <li>
            <Link to='/diffy' onClick={closeMenu}>Diffy</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

const App = () => {
  return (
    <HashRouter>
      <div>
        <Navigation />
        <Routes>
          <Route key="Home" path="/" element={<Home />} />
          <Route key="Serika" path="/serika" element={<Serika />} />
          <Route key="Diffy" path="/diffy" element={<Diffy />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
