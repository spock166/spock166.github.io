import React from 'react';
import './Styles/shared.css';
import './Styles/index.css';
import './Styles/navbar.css';
import ReactDOM from 'react-dom/client';
import { Routes, Route, HashRouter } from 'react-router-dom';

import Home from './Pages/Home';
import Serika from './Pages/Serika';
import Diffy  from './Pages/Diffy';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <HashRouter>
    <div>
      <header className='header'>
        <a href='/' className="logo">KDM</a>

        <input className='side-menu' type='checkbox' id='side-menu' />
        <label className='hamb' htmlFor='side-menu'><span className='hamb-line'></span></label>

        <nav className='nav'>
          <ul className='menu'>
            <li><a href='/'>Home</a></li>
            <li><a href='#/serika'>Serika</a></li>
            <li><a href='#/diffy'>Diffy</a></li>
          </ul>
        </nav>

      </header>

      <Routes>
        <Route key="Home" path="/" element={<Home />} />
        <Route key="Serika" path="/serika" element={<Serika />} />
        <Route key="Diffy" path="/diffy" element={<Diffy />} />
      </Routes>
    </div>
  </HashRouter>
);
