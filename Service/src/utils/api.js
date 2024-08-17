import axios from "axios";

export const apiurl = "http://172.16.101.97:3000/api";
export const socketURL = "ws://172.16.101.97:3000";

export const ServiceProviderLogin = async (data) => {
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
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const ServiceProviderSignup = async (data) => {
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
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const getVehicle = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/vehicles/${id}`);
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const getServiceProviderBookings = async (id, startDate, endDate) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/service-provider/${id}`, {
      params: {
        startDate,
        endDate,
      },
    });
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const getServiceProviderOngoingBookings = async (id) => {
  try {
    const res = await axios.get(
      `${apiurl}/bookings/service-provider/ongoing/${id}`
    );
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const getServiceProviderUpcomingBookings = async (id, date) => {
  try {
    const res = await axios.get(
      `${apiurl}/bookings/service-provider/upcoming/${id}`,
      {
        params: {
          date,
        },
      }
    );
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const getServiceProviderPastBookings = async (id, date) => {
  try {
    const res = await axios.get(
      `${apiurl}/bookings/service-provider/past/${id}`,
      {
        params: {
          date,
        },
      }
    );
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const getBooking = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/${id}`);
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const updateBooking = async (id, booking) => {
  try {
    const res = await axios.put(`${apiurl}/bookings/${id}`, booking);
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const getVehicleBookings = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/bookings/vehicle/${id}`);
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    const res = await axios.get(`${apiurl}/chat/${chatId}`);
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const getPaymentMethods = async (customerId) => {
  try {
    const res = await axios.get(`${apiurl}/payment/${customerId}`);
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const createSetupIntent = async (customerId) => {
  try {
    const res = await axios.get(`${apiurl}/payment/intent/${customerId}`);
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const deletePaymentMethod = async (paymentMethodId) => {
  try {
    const res = await axios.delete(`${apiurl}/payment/${paymentMethodId}`);
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const getServiceProviderServices = async (id) => {
  try {
    const res = await axios.get(`${apiurl}/service-provider/services/${id}`);
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const updateServiceProviderServices = async (id, services) => {
  try {
    const res = await axios.put(
      `${apiurl}/service-provider/services/${id}`,
      services
    );
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const updateUserProfile = async (id, updatedProfile) => {
  try {
    const response = await axios.put(
      `${apiurl}/service-provider/${id}`,
      updatedProfile
    );
    return response;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const getServiceProviderServicesCount = async (id, date) => {
  try {
    const res = await axios.get(
      `${apiurl}/service-provider/services/count/${id}`,
      date
    );
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const runAudict = async (id, date) => {
  try {
    const res = await axios.post(`${apiurl}/service-provider/audit/${id}`, {
      date,
    });
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const reverseLastAudit = async (id) => {
  try {
    const res = await axios.post(
      `${apiurl}/service-provider/reverse-audit/${id}`
    );
    return res;
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    return error.response;
  }
};
