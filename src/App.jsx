import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddVolunteer from './AddVolunteer';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path='add-volunteer' element={<AddVolunteer />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;