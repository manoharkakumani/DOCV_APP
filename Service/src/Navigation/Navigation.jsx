import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useSelector } from "react-redux";

import {
  Dashboard,
  SignIn,
  SignUp,
  BookingView,
  Profile,
  BookingSettings,
  Bookings,
  Chat,
} from "../components";

const Navigation = () => {
  const auth = useSelector((state) => state.auth);
  return (
    <Router>
      <Routes>
        <Route path="/" element={auth.user ? <Dashboard /> : <SignIn />} />
        <Route path="/booking" element={<BookingView />} />
        <Route path="/bookings" element={<Bookings bookingType="all" />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upcoming" element={<Bookings bookingType="upcoming" />} />
        <Route path="/ongoing" element={<Bookings bookingType="ongoing" />} />
        <Route
          path="/completed"
          element={<Bookings bookingType="completed" />}
        />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<BookingSettings />} />
      </Routes>
    </Router>
  );
};

export default Navigation;
