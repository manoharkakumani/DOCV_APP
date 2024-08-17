import axios from "axios";

export const apiurl = "http://172.16.101.97:3000/api";
export const socketURL = "ws://172.16.101.97:3000";

export const customerLogin = async (email, password) => {
  try {
    const res = await axios.post(`${apiurl}/customer/signin`, {
      email,
      password,
    });
    console.log("Signin response:", res.data);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const customerSignup = async (data) => {
  try {
    const res = await axios.post(
      `${apiurl}/customer/signup`,
      JSON.stringify(data),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res;
  } catch (error) {
    console.log(
      "Signup error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getCustomer = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/customer/${id}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const getCustomerVehicles = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/vehicle/user/${id}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const addVehicle = async (vehicle) => {
  try {
    const res = await axios.post(`${apiurl}/vehicle`, vehicle);
    console.log("Add Vehicle response:", res);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const getVehicle = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/vehicles/${id}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const getCustomerBookings = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/customer/${id}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const getCustomerOngoingBookings = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/customer/ongoing/${id}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};
export const getCustomerUpcomingBookings = async (id, date) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/customer/upcoming/${id}`, {
      params: { date },
    });
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};
export const getFutureBookingsByUserId = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/customer/future/${id}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const getCustomerPastBookings = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/customer/past/${id}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const addBooking = async (booking) => {
  try {
    const res = await axios.post(`${apiurl}/bookings`, booking);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const getBooking = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/${id}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const updateBooking = async (id, booking) => {
  try {
    const res = await axios.put(`${apiurl}/bookings/${id}`, booking);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const getVehicleBookings = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/vehicle/${id}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const addTowingBooking = async (booking) => {
  try {
    const res = await axios.post(`${apiurl}/bookings/towing`, booking);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    const res = await axios.get(`${apiurl}/chat/${chatId}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const createPaymentIntent = async (data) => {
  try {
    const res = await axios.post(
      `${apiurl}/payment/payment-intent`,
      JSON.stringify(data),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const getPaymentMethods = async (customerId) => {
  try {
    const res = await axios.get(`${apiurl}/payment/${customerId}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const createSetupIntent = async (customerId) => {
  try {
    const res = await axios.get(`${apiurl}/payment/intent/${customerId}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const deletePaymentMethod = async (paymentMethodId) => {
  try {
    const res = await axios.delete(`${apiurl}/payment/${paymentMethodId}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

// In utils/api.js
export const getNearbyServiceProviders = async (data) => {
  try {
    const response = await axios.post(
      `${apiurl}/service-provider/nearby`,
      data
    );
    return response;
  } catch (error) {
    console.error("Error in getNearbyServiceProviders:", error);
    throw error;
  }
};

export const getRide = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/ride/${id}`);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};

export const assignTower = async (bookingId) => {
  try {
    const data = { bookingId: bookingId };
    const res = await axios.post(
      `${apiurl}/service-provider/assign-tower/`,
      data
    );
    console.log("Assign Tower response:", res);
    return res;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};
