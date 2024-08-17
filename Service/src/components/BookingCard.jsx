import React from "react";
import { useNavigate } from "react-router-dom";

import { setBookingId } from "../store/authSlice";

import { useDispatch } from "react-redux";

const BookingCard = ({ booking }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div
        className="px-4 py-5 sm:p-6"
        onClick={() => {
          dispatch(setBookingId(booking._id));
          navigate(`/booking`);
        }}
      >
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {booking.customerId.name}
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Email: {booking.customerId.email}</p>
          <p>Phone: {booking.customerId.phone}</p>
          <p>Type: {booking.type}</p>
          <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6 justify-between flex items-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            booking.status === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : booking.status === "Ongoing"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {booking.status}
        </span>
        {/* chat */}
        {booking.status === "Pending" ||
        booking.status === "Ongoing" ||
        booking.status === "Accepted" ? (
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-gray-800 cursor-pointer"
            onClick={() =>
              console.log("Open Chat", booking.customerId.name, booking._id)
            }
          >
            Open Chat
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default BookingCard;
