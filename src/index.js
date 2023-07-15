import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import{ Routes, Route, HashRouter} from 'react-router-dom';

import Home from './Pages/Home';
import Anime from './Pages/Anime';
import Math from './Pages/Math';
import ToDo from './Pages/ToDo';
import Headpat from './Pages/Headpat';
import Serika from './Pages/Serika';
import Fall from './Pages/Fall';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HashRouter>
  <div>
    <header className='header'>
      <a href='/' className="logo">KDM</a> 

      <input className='side-menu' type = 'checkbox' id='side-menu'/>
      <label className='hamb' htmlFor='side-menu'><span className='hamb-line'></span></label>

      <nav className = 'nav'>
        <ul className='menu'>
        <li><a href='/'>Home</a></li>
        <li><a href='#/anime'>Anime</a></li>
        <li><a href='#/math'>Math</a></li>
        <li><a href='#/todo'>To Do Utility</a></li>
        <li><a href='#/headpat'>Headpats</a></li>
        <li><a href='#/serika'>Serika</a></li>
        <li><a href="https://www.insidejazzkc.com/home/jazz" target="_blank">You Like Jazz?</a></li>
        <li><a href="https://youtu.be/Qjqn37HKYaE" target="_blank">You Don't Like Jazz?</a>    </li>
        </ul>
      </nav>
      
    </header>
    
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/anime" element={<Anime />} />
      <Route path="/math" element={<Math />} />
      <Route path="/todo" element={<ToDo />} />
      <Route path="/headpat" element={<Headpat />} />
      <Route path="/serika" element={<Serika />} />
      <Route path="/fall" element={<Fall />} />
    </Routes>
  </div>
  </HashRouter>
);
