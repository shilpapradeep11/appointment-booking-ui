import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const CustomerForm = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    accountNumber: "",
    sortCode: "",
    email: ""
  });

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/customers", customer);
      const customerId = res.data.id;

      // Store customerId for use in appointment form
      localStorage.setItem("customerId", customerId);

      navigate("/book-appointment");
    } catch (err) {
      console.error("Failed to save customer", err);
      alert("Failed to save customer. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="h-20 bg-green-800 w-full" />

      {/* Form content centered */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
      <h2 className="text-3xl font-bold mb-8 justify-center">Enter the Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="firstName" placeholder="First Name" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="lastName" placeholder="Last Name" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="accountNumber" placeholder="Account Number" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="sortCode" placeholder="Sort Code" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required className="w-full border p-2 rounded" />
        
        <div className="flex justify-center gap-6 mt-4">
        <button
            type="submit"
            className="bg-green-700 text-white px-6 py-2 rounded font-semibold hover:bg-green-800 transition"
        > Next
        </button>
  
        <Link
            to="/"
             className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800 transition"
        > Cancel
        </Link>
        </div>        
      </form>
    </div>
    </div>
     {/* Thicker Footer */}
     <div className="h-20 bg-green-800 w-full" />
     </div>
  );
};

export default CustomerForm;
