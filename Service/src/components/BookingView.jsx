import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getBooking,
  updateBooking as updateBookingAPI,
  getServiceProviderServices,
} from "../utils/api";
import Navbar from "./Navbar";
import CollectPayment from "./CollectPayment";

const BookingView = () => {
  const auth = useSelector((state) => state.auth);
  const bookingId = auth.bookingId;
  const navigate = useNavigate();
  const [showCollectPayment, setShowCollectPayment] = useState(false);
  const [booking, setBooking] = useState({
    _id: "",
    date: new Date(),
    type: "",
    services: [],
    notes: [],
    customerId: {},
    charges: [],
    status: "",
    vehicleId: {},
    chatId: "",
    location: { type: "", coordinates: [] },
    paid: 0,
    balance: 0,
    time: "",
    cost: 0,
    serviceProviderId: {},
  });

  const [newService, setNewService] = useState({ name: "", price: "" });
  const [newNote, setNewNote] = useState("");
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [isManualService, setIsManualService] = useState(false);
  const [predefinedServices, setPredefinedServices] = useState([]);

  useEffect(() => {
    const fetchBooking = async (bookingId) => {
      const response = await getBooking(bookingId);
      if (response.status === 200) {
        setBooking(response.data);
      }
    };
    const fetchServices = async () => {
      const response = await getServiceProviderServices(auth.user._id);
      if (response.status === 200) {
        setPredefinedServices(response.data);
      }
    };
    if (bookingId) {
      fetchServices();
      fetchBooking(bookingId);
    }
  }, [bookingId]);

  const handlePaymentCollected = async (amount) => {
    try {
      // Call your API to process the payment

      const response = await updateBooking({
        paid: booking.paid + amount,
        balance: booking.cost - (booking.paid + amount),
      });
      if (response.status === 200) {
        console.log("Payment processed successfully");
        // Optionally, show a success message
        setShowCollectPayment(false);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      // Handle the error (e.g., show an error message)
    }
  };

  const updateBooking = async (updatedFields) => {
    try {
      const response = await updateBookingAPI(booking._id, updatedFields);
      if (response.status === 200) {
        setBooking((prevBooking) => ({ ...prevBooking, ...updatedFields }));
        // Optionally, show a success message
      }
      return response;
    } catch (error) {
      console.error("Error updating booking:", error);
      // Optionally, show an error message
    }
  };

  const addService = async () => {
    if (
      newService.name.trim() !== "" &&
      !booking.services.some(
        (s) => (typeof s === "string" ? s : s.name) === newService.name.trim()
      )
    ) {
      const serviceToAdd = isManualService
        ? {
            name: newService.name.trim(),
            price: parseFloat(newService.price) || 0,
          }
        : newService;
      const updatedServices = [...booking.services, serviceToAdd];
      await updateBooking({ services: updatedServices });
      setNewService({ name: "", price: "" });
      setIsManualService(false);
    }
  };

  const removeService = async (serviceToRemove) => {
    const updatedServices = booking.services.filter(
      (service) =>
        (typeof service === "string" ? service : service.name) !==
        serviceToRemove
    );
    await updateBooking({ services: updatedServices });
  };

  const addNote = async () => {
    if (newNote.trim() !== "") {
      const updatedNotes = [...booking.notes, newNote.trim()];
      await updateBooking({ notes: updatedNotes });
      setNewNote("");
    }
  };

  const removeNote = async (index) => {
    const updatedNotes = booking.notes.filter((_, i) => i !== index);
    await updateBooking({ notes: updatedNotes });
  };

  const startEditingNote = (index) => {
    setEditingNoteIndex(index);
    setNewNote(booking.notes[index]);
  };

  const saveEditedNote = async () => {
    if (newNote.trim() !== "") {
      const updatedNotes = booking.notes.map((note, index) =>
        index === editingNoteIndex ? newNote.trim() : note
      );
      await updateBooking({ notes: updatedNotes });
      setEditingNoteIndex(null);
      setNewNote("");
    }
  };

  const updateStatus = async (newStatus) => {
    await updateBooking({ status: newStatus });
  };

  const totalCharges = bookingId
    ? booking.services.reduce((sum, service) => sum + service.price, 0)
    : 0;

  useEffect(() => {
    if (totalCharges !== booking.cost) {
      updateBooking({
        cost: totalCharges,
        balance: totalCharges - booking.paid,
      });
    }
  }, [totalCharges]);

  if (!auth.user || !bookingId) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <Navbar />

      <div className="pt-5 px-4">
        {booking.status === "Completed" ? (
          <></>
        ) : (
          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => navigate(`/chat`)}
            >
              Chat
            </button>
            {booking.status === "Cancelled" ? (
              <></>
            ) : booking.balance > 0 ? (
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={() => setShowCollectPayment(true)}
              >
                Collect Payment
              </button>
            ) : booking.paid > booking.cost ? (
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={() => setShowCollectPayment(true)}
              >
                Refund
              </button>
            ) : booking.services.length > 0 ? (
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={() => updateBooking({ status: "Completed" })}
              >
                Mark Completed
              </button>
            ) : null}
            {showCollectPayment && (
              <CollectPayment
                booking={booking}
                onClose={() => setShowCollectPayment(false)}
                onPaymentCollected={handlePaymentCollected}
              />
            )}
          </div>
        )}
        <div className="flex justify-between items-center mb-6 border p-3 mt-6 rounded-lg">
          <div className="flex flex-col">
            <p>Name: {booking.customerId.name}</p>
            <p> Email: {booking.customerId.email}</p>
            <p> Phone: {booking.customerId.phone}</p>
            <p> Date: {new Date(booking.date).toLocaleDateString()}</p>
          </div>
          {auth.user._id === booking.serviceProviderId._id && (
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 pr-5">
                Status
              </span>
              <select
                value={booking.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="border rounded px-2 py-1 mr-2"
              >
                {booking.status === "Pending" ? (
                  <>
                    <option value="Pending">Pending</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Cancelled">Cancel</option>
                  </>
                ) : booking.status === "Ongoing" ? (
                  <>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Cancelled">Cancel</option>
                  </>
                ) : booking.status === "Completed" ? (
                  <>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </>
                ) : (
                  <>
                    <option value="Cancelled">Cancel</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Vehicle Details</h3>
            <p>Make: {booking.vehicleId.make}</p>
            <p>Model: {booking.vehicleId.model} </p>
            <p>Year: {booking.vehicleId.year}</p>
            <p>Registration: {booking.vehicleId.registrationPlate}</p>
          </div>

          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Services</h3>
            <ul className="mb-2">
              {booking.services.map((service, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center mb-1"
                >
                  {typeof service === "string" ? service : service.name}
                  {booking.status !== "Completed" && (
                    <>
                      <span>
                        $
                        {typeof service === "string"
                          ? predefinedServices[service]
                          : service.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() =>
                          removeService(
                            typeof service === "string" ? service : service.name
                          )
                        }
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {booking.status !== "Completed" && (
              <div className="flex flex-col">
                <div className="flex mb-2">
                  <input
                    type="checkbox"
                    checked={isManualService}
                    onChange={() => setIsManualService(!isManualService)}
                    className="mr-2"
                  />
                  <label>Manual Service</label>
                </div>
                {isManualService ? (
                  <>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) =>
                        setNewService({ ...newService, name: e.target.value })
                      }
                      className="border rounded px-2 py-1 mb-2"
                      placeholder="Service name"
                    />
                    <input
                      type="number"
                      value={newService.price}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          price: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1 mb-2"
                      placeholder="Price"
                    />
                  </>
                ) : (
                  <select
                    value={newService.name}
                    onChange={(e) => {
                      const selectedService = predefinedServices.find(
                        (s) => s.name === e.target.value
                      );
                      if (selectedService) {
                        setNewService({
                          name: selectedService.name,
                          price: selectedService.price,
                        });
                      }
                    }}
                    className="border rounded px-2 py-1 mb-2"
                  >
                    <option value="">Select a service</option>
                    {predefinedServices.map((service, index) => (
                      <option key={service.name} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={addService}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Add Service
                </button>
              </div>
            )}
          </div>
          {booking.status !== "Completed" && (
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Charges</h3>
              {booking.services.map((service, index) => (
                <div key={index} className="flex justify-between mb-2">
                  <span>{service.name}</span>
                  <span>${service.price.toFixed(2)}</span>
                </div>
              ))}
              {/* paid */}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span>Paid</span>
                <span>-${booking.paid.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${(booking.cost - booking.paid).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Notes</h3>
          {booking.notes.map((note, index) => (
            <div key={index} className="flex items-center mb-2">
              {editingNoteIndex === index ? (
                <>
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-grow border rounded-l px-2 py-1"
                  />
                  <button
                    onClick={saveEditedNote}
                    className="bg-green-500 text-white px-2 py-1 rounded-r hover:bg-green-600"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p className="flex-grow border p-2 rounded-lg">{note}</p>
                  {booking.status !== "Completed" && (
                    <>
                      <button
                        onClick={() => startEditingNote(index)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeNote(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
          {booking.status !== "Completed" && editingNoteIndex === null && (
            <div className="flex mt-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-grow border rounded-l px-2 py-1"
                placeholder="Add a note"
              />
              <button
                onClick={addNote}
                className="bg-blue-500 text-white px-2 py-1 rounded-r hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingView;
