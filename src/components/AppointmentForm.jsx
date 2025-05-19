import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const loadingSteps = [
  "Assessing colleague workload",
  "Detecting scheduling overlaps",
  "Evaluating skill compatibility",
  "Confirming urgency (within 24 hours)",
];

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    applicationType: "",
    interactionMethod: "",
    requestedDate: "",
  });

  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [visibleSteps, setVisibleSteps] = useState([]);

 useEffect(() => {
    if (submissionMessage) {
      const timeout = setTimeout(() => setSubmissionMessage(""), 6000);
      return () => clearTimeout(timeout);
    }
  }, [submissionMessage]);

  const handleAppType = (type) => {
    setFormData({
      ...formData,
      applicationType: type,
      interactionMethod: "",
      requestedDate: "",
    });
    setSubmissionMessage("");
  };

  const handleInteraction = (method) => {
    setFormData({
      ...formData,
      interactionMethod: method,
      requestedDate: "",
    });
    setSubmissionMessage("");
  };

  const handleDate = (e) => {
    setFormData({ ...formData, requestedDate: e.target.value });
    setSubmissionMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); // Show spinner
    const customerId = localStorage.getItem("customerId");
  
    if (!customerId) {
      alert("Customer ID missing. Please fill customer form first.");
      setSubmitting(false);
      return;
    }
  
    const payload = {
      applicationType: formData.applicationType,
      interactionMethod: formData.interactionMethod,
      requestedDate: formData.requestedDate,
      customer: { id: Number(customerId) },
    };
  
    try {
      const response = await axios.post("http://localhost:8080/api/appointment", payload);
  
      if (
        typeof response.data === "string" &&
        response.data.includes("No available colleague")
      ) {
        setSubmissionMessage("⚠️ No colleague is available at this time. Please choose a different date/time.");
        setSubmitting(false); // hide spinner immediately
        return;
      }
  
      setSubmissionMessage("Your appointment has been submitted successfully!");
  
      // Wait for the spinner steps to finish before showing feedback
      setTimeout(() => {
        setSubmitting(false);    // hide spinner
        setShowFeedback(true);   // show feedback popup
      }, loadingSteps.length * 800 + 500); // timing for spinner steps
  
    } catch (error) {
      if (
        error.response &&
        error.response.status === 409 &&
        typeof error.response.data === "string" &&
        error.response.data.includes("No available colleague")
      ) {
        setSubmissionMessage("⚠️ No colleague is available at this time. Please choose a different date/time.");
      } else {
        setSubmissionMessage("Failed to submit appointment. Please try again.");
        console.error(error);
      }
      setSubmitting(false); // move here instead of finally
    }
  };
    

  useEffect(() => {
    if (!submitting) {
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
  }, [submitting]);
 

  return (
    <>
      {/* Spinner Overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow text-center animate-pulse">
            <div className="w-10 h-10 border-t-4 border-green-600 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-semibold text-gray-800">Processing your appointment...</p>
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

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Rate your experience</h3>

            <div className="flex gap-2 mb-4 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    rating >= star ? "text-yellow-400" : "text-gray-400"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              className="w-full border p-2 rounded mb-4"
              rows={3}
              placeholder="Leave a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 w-full"
              onClick={async () => {
                try {
                  const response = await axios.get("http://localhost:8080/api/colleagueDetails");
                  const colleagues = response.data;
                  if (!colleagues.length) {
                    alert("No colleagues found to assign feedback.");
                    return;
                  }

                  const randomColleague =
                    colleagues[Math.floor(Math.random() * colleagues.length)];

                    await axios.post("http://localhost:8080/api/colleague-feedback", {
                      rating,
                      comment,
                      colleagueId: randomColleague.id,
                    });
                    
                    // ✅ Hide feedback and stop spinner
                    setShowFeedback(false);
                    setSubmitting(false);
                    setRating(0);
                    setComment("");
                    
                } catch (err) {
                  console.error("Feedback submission failed", err);
                  alert("Could not submit feedback. Try again later.");
                }
              }}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="h-20 bg-green-800 w-full" />

        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl text-center">
          
          {submissionMessage && (
            <div
              className={`text-sm p-4 rounded-md text-center mt-4 ${
                submissionMessage.includes("⚠️")
                  ? "text-red-700 bg-red-100"
                  : "text-green-800 bg-green-100"
              }`}
            >
              {submissionMessage}
            </div>
          )}
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Book Appointment</h1>

            {/* Application Type */}
            <p className="text-gray-700 font-medium text-left mb-2">
              What is the appointment for?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {["Banking", "Borrowing", "Mortgages", "Insurance", "Other services"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAppType(type)}
                  className={`p-3 rounded border-2 font-semibold transition ${
                    formData.applicationType === type
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-green text-green-700 border-green-700 hover:bg-green-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Interaction Method */}
            {formData.applicationType && (
              <>
                <p className="text-gray-700 font-medium text-left mb-2">
                  Select interaction method
                </p>
                <div className="flex gap-4 justify-left mb-6">
                  {["Audio", "Video"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => handleInteraction(method)}
                      className={`px-6 py-3 rounded border-2 font-medium transition ${
                        formData.interactionMethod === method
                          ? "bg-green-700 text-green border-green-700"
                          : "bg-white text-green-700 border-green-700 hover:bg-green-100"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Date Picker */}
            {formData.interactionMethod && (
              <>
                <p className="text-gray-700 font-medium text-left mb-2">
                  Select date and time
                </p>
                <div className="mb-6 flex justify-left">
                  <input
                    type="datetime-local"
                    className={`p-3 border-2 rounded w-2/3 transition ${
                      formData.requestedDate
                        ? "border-green-700 text-green-700 font-semibold"
                        : "border-gray-300"
                    }`}
                    value={formData.requestedDate}
                    onChange={handleDate}
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            {formData.requestedDate && (
              <div className="flex justify-center gap-8 mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`bg-green-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 transition ${
                    submitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? "Submitting..." : "Submit Appointment"}
                </button>

                <Link
                  to="/"
                  className="bg-green-700 text-white px-5 py-3 rounded-lg font-bold hover:bg-green-800 transition"
                >
                  Cancel
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="h-20 bg-green-800 w-full" />
      </div>
    </>
  );
};

export default AppointmentForm;
