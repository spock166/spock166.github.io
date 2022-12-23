import React from "react";
import{BrowserRouter, Routes, Route} from 'react-router-dom';

import Home from '../Pages/Home';
import Anime from '../Pages/Anime';
import Math from '../Pages/Math';
import ToDo from '../Pages/ToDo';
import Headpat from '../Pages/Headpat';

function AppRouter(){
    return(
        <HashRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/anime" element={<Anime />} />
                <Route path="/math" element={<Math />} />
                <Route path="/todo" element={<ToDo />} />
                <Route path="/headpat" element={<Headpat />} />
            </Routes>
        </HashRouter>
    );
}

export default AppRouter;