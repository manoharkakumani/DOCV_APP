import React, { useState, useEffect } from "react";
import BookingCard from "./BookingCard";
import NavBar from "./Navbar";
import Loading from "./Loading";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import {
  getServiceProviderBookings,
  getServiceProviderUpcomingBookings,
  getServiceProviderPastBookings,
  getServiceProviderOngoingBookings,
} from "../utils/api";

import { toISOString } from "../utils/constants";

const Bookings = ({ bookingType }) => {
  const auth = useSelector((state) => state.auth);
  const [fetchedBookings, setFetchedBookings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState(
    toISOString(auth.user ? auth.user.lastAudit : new Date())
  );
  const [endDate, setEndDate] = useState(
    toISOString(auth.user ? auth.user.lastAudit : new Date())
  );
  const [loading, setLoading] = useState(true);

  const fetchBookings = async (start, end) => {
    setSearchName("");
    setLoading(true);
    setStartDate(start);
    setEndDate(end);

    let response;
    switch (bookingType) {
      case "upcoming":
        response = await getServiceProviderUpcomingBookings(
          auth.user._id,
          start
        );
        break;
      case "completed":
        response = await getServiceProviderPastBookings(auth.user._id, start);
        break;
      case "ongoing":
        response = await getServiceProviderOngoingBookings(auth.user._id);
        break;
      default:
        if (start > end) {
          alert("Start date cannot be greater than end date");
          setLoading(false);
          return;
        }
        response = await getServiceProviderBookings(auth.user._id, start, end);
    }

    if (response.status === 200) {
      setFetchedBookings(response.data);
      setBookings(response.data);
    }
    setLoading(false);
  };

  const filterBookings = (searchName) => {
    setBookings(
      fetchedBookings.filter(
        (booking) =>
          !searchName ||
          booking.customerId.name
            .toLowerCase()
            .includes(searchName.toLowerCase())
      )
    );
  };

  useEffect(() => {
    setBookings([]);
    setFetchedBookings([]);
    const today = toISOString(auth.user ? auth.user.lastAudit : new Date());
    setEndDate(today);
    setStartDate(today);
    setSearchName("");
    console.log("fetching bookings");
    fetchBookings(today, today);
  }, [bookingType, auth.user._id]);

  useEffect(() => {
    filterBookings(searchName);
  }, [searchName]);

  return !auth.user ? (
    <Navigate to="/" />
  ) : (
    <div>
      <NavBar />
      {loading ? (
        <Loading />
      ) : (
        <div className="max-w-7xl mx-auto p-10">
          <div className="pb-8  mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bookingType !== "ongoing" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate.split("T")[0]}
                    min={
                      bookingType === "upcoming"
                        ? toISOString(auth.user.lastAudit).split("T")[0]
                        : undefined
                    }
                    onChange={(e) =>
                      setStartDate(toISOString(new Date(e.target.value)))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}
              {bookingType === "all" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate.split("T")[0]}
                    onChange={(e) =>
                      setEndDate(toISOString(new Date(e.target.value)))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}
              {bookingType !== "ongoing" && (
                <div className="flex items-end">
                  <button
                    onClick={() => fetchBookings(startDate, endDate)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Search
                  </button>
                </div>
              )}
              {bookings.length || searchName ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search by name"
                  />
                </div>
              ) : null}
            </div>
          </div>

          {bookings.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {
                  {
                    upcoming: "No Upcoming bookings found",
                    completed: "No Completed bookings found",
                    ongoing: "No Ongoing bookings found",
                    all: "No bookings found",
                  }[bookingType]
                }
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or date range.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bookings;
