import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ColleagueDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const [allocating, setAllocating] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState([]);

  const loadingSteps = [
    "Assessing colleague workload",
    "Detecting scheduling overlaps",
    "Evaluating skill compatibility",
  ];

  

  const fetchAppointments = async (pageNumber = 0) => {
    try {
      const res = await axios.get(
        `https://appointment-booking-api-cihz.onrender.com/api/manual-review-appointments?page=${pageNumber}&size=${pageSize}`
      );
      setAppointments(res.data.content.map(appt => ({
        ...appt,
        colleagueAvailable:
          appt.status === "Manually Allocated" || appt.status === "Auto-allocated"
            ? true
            : appt.colleagueAvailable
      })));
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(page);
  }, [page]);

  // const [allocatedIds, setAllocatedIds] = useState([]);

  const handleAllocate = async (appointmentId) => {
    try {
      setAllocating(true); // Start spinner
  
      const appointment = appointments.find(appt => appt.appointmentId === appointmentId);
      if (!appointment) return;
  
      await axios.post("https://appointment-booking-api-cihz.onrender.com/api/allocate-colleague", {
        appointmentId: appointmentId,
        applicationType: appointment.applicationType,
      });
  
      await fetchAppointments(page);
  
      // Wait until all spinner steps have been shown (~800ms * steps)
      setTimeout(() => {
        setAllocating(false);
      }, loadingSteps.length * 800 + 300); // + buffer for smooth finish
    } catch (err) {
      console.error("Allocation failed", err);
      alert("Error during allocation.");
      setAllocating(false); // Hide spinner on error
    }
  };
  

useEffect(() => {
    if (!allocating) {
      setVisibleSteps([]);
      return;
    }
  
    const interval = setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev.length < loadingSteps.length) {
          return [...prev, loadingSteps[prev.length]];
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 800);
  
    return () => clearInterval(interval);
  }, [allocating]);
 

  return (
    <>
    <div className="main-ui-content">
      {/* your existing dashboard */}
    </div>

    {allocating && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow text-center animate-pulse">
          <div className="w-10 h-10 border-t-4 border-green-600 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-semibold bg-green text-gray-800">AI model is evaluating assignment criteria...</p>
          <ul className="text-sm text-gray-700 list-none mt-4 text-left">
              {visibleSteps.map((step, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✔️</span> {step}
                </li>
              ))}
            </ul>
        </div>
      </div>
    )}
    

    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="h-20 bg-green-800 w-full" />

      {/* Main content fills the middle space */}
      <div className="flex-grow overflow-auto flex items-start justify-center p-6">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-5xl">
          <div className="mb-4">
            <Link
              to="/"
              className="inline-block bg-green-700 text-white px-4 py-2 rounded font-medium hover:bg-green-800"
            >
              ← Back to Main Form
            </Link>
          </div>

          <h2 className="text-2xl font-bold mb-4">Manual Review Appointments</h2>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-600">No appointments to review.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="border px-4 py-2">Application Type</th>
                    <th className="border px-4 py-2">Interaction</th>
                    <th className="border px-4 py-2">Requested Date</th>
                    <th className="border px-4 py-2">Colleague</th>
                    <th className="border px-4 py-2">Available</th>
                    <th className="border px-4 py-2">Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.appointmentId}>
                      <td className="border px-4 py-2">{appt.applicationType}</td>
                      <td className="border px-4 py-2">{appt.interactionMethod}</td>
                      <td className="border px-4 py-2">{appt.requestedDate}</td>
                      <td className="border px-4 py-2">{appt.colleagueName}</td>
                      <td className="border px-4 py-2">
                        {appt.colleagueAvailable ? "✅ Yes" : "❌ No"}
                      </td>
                      <td className="border px-4 py-2">
                      <button
                          onClick={() => handleAllocate(appt.appointmentId)}
                          disabled={appt.status === "Manually Allocated" || appt.status === "Auto-allocated"}
                          className={`px-3 py-1 rounded font-medium transition ${
                            appt.status === "Manually Allocated" || appt.status === "Auto-allocated"
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          Allocate
                        </button>

                      </td>                      
                    </tr>
                  ))}
                </tbody>
              </table>
              

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4 space-x-4">
          <button
            disabled={page === 0}
            onClick={() => setPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded border text-white-700 border-green-700 hover:bg-green-700 transition ${
              page === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            ← Previous
          </button>

          <span className="text-gray-700 font-medium self-center">
            Page {page + 1} of {totalPages}
          </span>

          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className={`px-4 py-2 rounded border text-white-700 border-green-700 hover:bg-green-700 transition ${
              page + 1 >= totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next →
          </button>
        </div>
                    </div>
                  )}
                </div>
              </div>

      {/* Footer stays at the bottom */}
      <div className="h-20 bg-green-800 w-full" />
    </div>
    </>
  );
};

export default ColleagueDashboard;
