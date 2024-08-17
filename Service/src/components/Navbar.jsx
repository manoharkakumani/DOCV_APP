import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { toLocaleDateString } from "../utils/constants";
import {
  FaBars,
  FaTimes,
  FaCog,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaHome,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const navItems = [
    { path: "/", name: "Dashboard", icon: <FaHome /> },
    { path: "/ongoing", name: "Ongoing", icon: <FaClock /> },
    { path: "/upcoming", name: "Upcoming", icon: <FaCalendarAlt /> },
    { path: "/completed", name: "Completed", icon: <FaCheck /> },
    { path: "/bookings", name: "Search", icon: <FaSearch /> },
    { path: "/settings", name: "Settings", icon: <FaCog /> },
    { path: "/profile", name: "Profile", icon: <FaUser /> },
  ];

  const toggleNav = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center flex-1">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">DOCV</h1>
            </Link>
            <span className="md:hidden text-white px-3 py-2 rounded-md text-sm font-medium mr-2">
              Welcome {auth.user ? auth.user.name : "User"}
            </span>
            <div className="hidden md:block ml-6 flex-1">
              <div className="flex items-baseline space-x-4">
                {location.pathname === "/" ? (
                  <div className="flex-1 text-center">
                    <span className="text-white px-3 py-2 rounded-md text-sm font-medium mr-2">
                      Welcome {auth.user ? auth.user.name : "User"}
                    </span>
                  </div>
                ) : (
                  navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`${
                        location.pathname === item.path
                          ? "bg-teal-950 text-white animate-pulse"
                          : "text-indigo-200 hover:bg-teal-950 hover:text-white"
                      } px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center`}
                    >
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
          <span className="text-white px-3 py-2 rounded-md text-sm font-medium">
            {auth.user.lastAudit
              ? toLocaleDateString(auth.user.lastAudit)
              : Date.now()}
          </span>
          <div
            onClick={handleLogout}
            className="hidden md:flex items-center text-indigo-200 hover:bg-teal-950 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            <FaSignOutAlt />
            <span className="ml-2">Logout</span>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleNav}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {location.pathname === "/" ? (
              <></>
            ) : (
              navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? "bg-indigo-700 text-white"
                      : "text-indigo-200 hover:bg-indigo-500 hover:text-white"
                  } block px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out flex items-center`}
                  onClick={toggleNav}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              ))
            )}
            <div
              onClick={handleLogout}
              className="text-indigo-200 hover:bg-teal-950 hover:text-white
               px-3 py-2 rounded-md text-sm font-medium flex items-center cursor-pointer"
            >
              <FaSignOutAlt />
              <span className="ml-2">Logout</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
