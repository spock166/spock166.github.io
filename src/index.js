import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import{BrowserRouter, Routes, Route, HashRouter} from 'react-router-dom';

import Home from './Pages/Home';
import Anime from './Pages/Anime';
import Math from './Pages/Math';
import ToDo from './Pages/ToDo';
import Headpat from './Pages/Headpat';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HashRouter>
  <div>
    <div className='App-header'>
      <a className='menu-btn' href='/'>Home</a>
      <a className='menu-btn' href='#/anime'>Anime</a>
      <a className='menu-btn' href='#/math'>Math</a>
      <a className='menu-btn' href='#/todo'>To Do Utility</a>
      <a className='menu-btn' href='#/headpat'>Headpats</a>

      <a className='menu-btn' href="https://www.insidejazzkc.com/home/jazz" target="_blank">You Like Jazz?</a>
      <a className='menu-btn' href="https://youtu.be/SCrzYRTewzU" target="_blank">You Don't Like Jazz?</a>
    </div>

    
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/anime" element={<Anime />} />
                <Route path="/math" element={<Math />} />
                <Route path="/todo" element={<ToDo />} />
                <Route path="/headpat" element={<Headpat />} />
            </Routes>
    
</div>
</HashRouter>
);
