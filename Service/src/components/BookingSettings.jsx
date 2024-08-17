import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from "react-icons/fa";
import NavBar from "./Navbar";
import Loading from "./Loading";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { login } from "../store/authSlice";
import {
  getServiceProviderServices,
  updateServiceProviderServices,
  runAudict,
  reverseLastAudit,
} from "../utils/api";
import { toISOString, getNextDate } from "../utils/constants";

const BookingSettings = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("services");

  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: "", price: "" });
  const [editingId, setEditingId] = useState(null);

  const [bookingSettings, setBookingSettings] = useState({
    leadTime: { min: 2, max: 336 }, // 2 hours to 2 weeks
    cancellationPolicy: { deadline: 24, fee: 0 },
    intervalMinutes: 30,
    maxSimultaneousBookings: 1,
    autoConfirm: true,
  });

  const [auditResult, setAuditResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const servicesResponse = await getServiceProviderServices(auth.user._id);
      if (servicesResponse.status === 200) {
        setServices(servicesResponse.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [auth.user._id]);

  const handleAddService = async () => {
    if (newService.name && newService.price) {
      const response = await updateServiceProviderServices(auth.user._id, [
        ...services,
        {
          id: services.length + 1,
          name: newService.name,
          price: parseFloat(newService.price),
        },
      ]);
      if (response.status === 200) {
        setServices(response.data);
      }
      setNewService({ name: "", price: "" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService({ ...newService, [name]: value });
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = async (id) => {
    const updatedServices = services.map((service) =>
      service.id === id
        ? { ...service, price: parseFloat(service.price) }
        : service
    );
    const response = await updateServiceProviderServices(
      auth.user._id,
      updatedServices
    );
    if (response.status === 200) {
      setServices(response.data);
    }
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const updatedServices = services.filter((service) => service.id !== id);
    const response = await updateServiceProviderServices(
      auth.user._id,
      updatedServices
    );
    if (response.status === 200) {
      setServices(response.data);
    }
  };

  const handleEditChange = (e, id) => {
    const { name, value } = e.target;
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, [name]: value } : service
      )
    );
  };

  const handleRunAudit = async () => {
    const response = await runAudict(
      auth.user._id,
      auth.user.lastAudit
        ? getNextDate(auth.user.lastAudit)
        : getNextDate(new Date())
    );
    if (response.status === 200) {
      setAuditResult(
        `Successfully cancelled ${
          response.data.cancelledCount
        } overdue bookings. Audit date: ${new Date(
          response.data.auditDate
        ).toLocaleDateString()}`
      );
      dispatch(login(response.data.serviceProvider));
      setTimeout(() => setAuditResult(null), 5000);
    }
  };

  const handleReverseAudit = async () => {
    const response = await reverseLastAudit(auth.user._id);
    if (response.status === 200) {
      setAuditResult(
        `${response.data.message}. Audit date: ${new Date(
          response.data.auditDate
        ).toLocaleDateString()}`
      );
      dispatch(login(response.data.serviceProvider));
      setTimeout(() => setAuditResult(null), 5000);
    }
  };

  if (!auth.user) return <Navigate to="/" />;

  return (
    <div>
      <NavBar />
      {loading ? (
        <Loading />
      ) : (
        <div className="max-w-4xl mx-auto mt-10 p-8">
          <div className="mb-6">
            <div className="flex border-b">
              {["services", "audit"].map((tab) => (
                <button
                  key={tab}
                  className={`py-2 px-4 ${
                    activeTab === tab
                      ? "border-b-2 border-blue-500"
                      : " hover:bg-gray-100"
                  } font-bold text-lg`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "services" && (
            <div className="max-w-2xl mx-auto overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between items-center p-4 rounded-lg transition duration-300 hover:bg-gray-100"
                    >
                      {editingId === service.id ? (
                        <>
                          <input
                            type="text"
                            name="name"
                            value={service.name}
                            onChange={(e) => handleEditChange(e, service.id)}
                            className="w-1/3 p-2 border border-gray-300 rounded-md mr-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="number"
                            name="price"
                            value={service.price}
                            onChange={(e) => handleEditChange(e, service.id)}
                            className="w-1/3 p-2 border border-gray-300 rounded-md mr-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSave(service.id)}
                              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-300"
                              title="Save"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
                              title="Cancel"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-gray-700 text-lg">
                            {service.name}
                          </span>
                          <span className="text-gray-600 font-medium">
                            ${service.price.toFixed(2)}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(service.id)}
                              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(service.id)}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    Add New Service
                  </h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      name="name"
                      value={newService.name}
                      onChange={handleInputChange}
                      placeholder="Service name"
                      className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      name="price"
                      value={newService.price}
                      onChange={handleInputChange}
                      placeholder="Price"
                      className="w-1/4 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddService}
                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-300"
                      title="Add Service"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div>
              <div className="space-y-4 justify-between flex items-center">
                <button
                  onClick={handleRunAudit}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Run Audit
                </button>
                <button
                  onClick={handleReverseAudit}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Reverse Last Audit
                </button>
              </div>
              {auditResult && (
                <p className="mt-4 text-sm text-gray-600">{auditResult}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingSettings;
