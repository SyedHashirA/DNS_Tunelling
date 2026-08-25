import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DNSTunnelingApp from './dns-tunneling/DNSTunnelingApp';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dns-tunneling/*" element={<DNSTunnelingApp />} />
    </Routes>
  );
};

export default App;
