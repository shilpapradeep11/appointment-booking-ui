import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomerForm from "./components/CustomerForm";
import AppointmentForm from "./components/AppointmentForm";
import ColleagueDashboard from "./components/ColleagueDashboard";
import Appointments from "./components/Appointments";


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <Routes>
          <Route path="/" element={<Appointments />} />
          <Route path="/customer-form" element={<CustomerForm />} />
          <Route path="/book-appointment" element={<AppointmentForm />} />
          <Route path="/dashboard" element={<ColleagueDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
