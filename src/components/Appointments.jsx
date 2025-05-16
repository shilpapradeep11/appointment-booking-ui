import React from "react";
import { useNavigate } from "react-router-dom";

const Appointments = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Thicker Header */}
      <div className="h-20 bg-green-800 w-full" />

      {/* Main content centered */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-10 rounded-lg shadow-md text-center max-w-xl w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Appointments</h1>
          <div className="flex justify-center gap-8">
            <button
              onClick={() => navigate("/customer-form")}
              className="px-6 py-3 rounded-lg font-semibold border-2 border-green-700 text-green-700 bg-transparent hover:bg-green-700 hover:text-white transition"
            >
              Book an Appointment
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-lg font-semibold border-2 border-green-700 text-green-700 bg-transparent hover:bg-green-700 hover:text-white transition"
            >
              Colleague Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Thicker Footer */}
      <div className="h-20 bg-green-800 w-full" />
    </div>
  );
};

export default Appointments;
