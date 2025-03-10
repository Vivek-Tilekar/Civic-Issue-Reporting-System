import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddVolunteer from './AddVolunteer';
import Login from './Login';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path='add-volunteer' element={<AddVolunteer />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;