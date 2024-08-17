import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

import { FaCog, FaUser, FaSearch } from "react-icons/fa";

import { getServiceProviderServicesCount } from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [servicesCount, setServicesCount] = useState({
    ongoingServices: 0,
    completedServices: 0,
    upcomingServices: 0,
  });

  useEffect(() => {
    const fetchServicesCount = async () => {
      const response = await getServiceProviderServicesCount(
        auth.user._id,
        auth.lastAudit
      );
      if (response.status === 200) {
        setServicesCount(response.data);
      }
      setLoading(false);
    };
    if (auth.user) {
      setLoading(true);
      fetchServicesCount();
    }
  }, [auth.user._id]);

  if (!auth.user) {
    navigate("/");
  }
  return (
    <div>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <main className="pt-24 px-4 mt-6">
          {/* Added padding-top to account for fixed header */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <DashboardCard
                title="Upcoming"
                value={servicesCount.upcomingServices}
                bgColor="bg-yellow-400"
                textColor="text-yellow-900"
                onClick={() => navigate("/upcoming")}
              />
              <DashboardCard
                title="Ongoing"
                value={servicesCount.ongoingServices}
                bgColor="bg-green-400"
                textColor="text-green-900"
                onClick={() => navigate("/ongoing")}
              />
              <DashboardCard
                title="Completed"
                value={servicesCount.completedServices}
                bgColor="bg-blue-400"
                textColor="text-blue-900"
                onClick={() => navigate("/completed")}
              />
              <DashboardCard
                title="Bookings Search"
                icon={<FaSearch />}
                bgColor="bg-gray-400"
                textColor="text-blue-900"
                onClick={() => navigate("/bookings")}
              />
              <DashboardCard
                title="Booking Settings"
                icon={<FaCog />}
                bgColor="bg-indigo-400"
                textColor="text-indigo-900"
                onClick={() => navigate("/settings")}
              />
              <DashboardCard
                title="Profile Management"
                icon={<FaUser />}
                bgColor="bg-pink-400"
                textColor="text-pink-900"
                onClick={() => navigate("/profile")}
              />
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

const DashboardCard = ({ title, value, icon, bgColor, textColor, onClick }) => {
  return (
    <div
      className={`${bgColor} ${textColor} rounded-lg p-6 flex flex-col items-center justify-center h-40 shadow-lg transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer`}
      onClick={onClick}
    >
      {icon && <div className="mb-3 text-4xl">{icon}</div>}
      <div className="text-lg font-semibold text-center mb-2">{title}</div>
      {value !== null && <div className="text-3xl font-bold">{value}</div>}
    </div>
  );
};

export default Dashboard;
