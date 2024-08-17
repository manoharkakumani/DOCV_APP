import axios from "axios";

export const apiurl = "http://172.16.101.97:3000/api";
export const socketURL = "ws://172.16.101.97:3000";

export const serviceProviderLogin = async (data) => {
  try {
    const res = await axios.post(
      `${apiurl}/service-provider/signin`,
      JSON.stringify(data),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

export const serviceProviderSignup = async (data) => {
  try {
    const res = await axios.post(
      `${apiurl}/service-provider/signup`,
      JSON.stringify(data),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Signup response:", res);
    return res;
  } catch (error) {
    console.log(
      "Signup error:",
      error.response ? error.response.data : error.message
    );
    return error.response;
  }
};

export const getServiceProvider = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/service-provider/${id}`);
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

export const getVehicle = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/vehicles/${id}`);
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

export const getServiceProviderBookings = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/service-provider/${id}`);
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

// In your api.js or similar file
export const getServiceProviderOngoingBookings = async (id) => {
  try {
    const response = await axios.get(`${apiurl}/bookings/tower/ongoing/${id}`);
    // console.log("API response:", response); // Add this line
    return response;
  } catch (error) {
    console.error("API error:", error); // Add this line
    return error.response;
  }
};

export const getServiceProviderPastBookings = async (id) => {
  try {
    const res = await axios.get(
      `${apiurl}/bookings/service-provider/past/${id}`
    );
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

export const getBooking = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/${id}`);
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

export const updateBooking = async (id, booking) => {
  try {
    const res = await axios.put(`${apiurl}/bookings/${id}`, booking);
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

export const getChatMessages = async (chatId) => {
  console.log("Getting chat messages for chat ID:", chatId);
  try {
    const res = await axios.get(`${apiurl}/chat/${chatId}`);
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

export const getEarnings = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/earnings/${id}`);
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

export const getThisWeekEarnings = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/earnings/this-week/${id}`);
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

export const getLastWeekEarnings = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/earnings/last-week/${id}`);
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

// get ride

export const getRide = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/ride/${id}`);
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

// update ride

export const updateRide = async (id, data) => {
  try {
    const res = await axios.put(`${apiurl}/ride/${id}`, data);
    return res;
  } catch (error) {
    console.log(error);
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
