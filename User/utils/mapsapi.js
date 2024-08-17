const MAPS_APIKEY = "b8568cb9afc64fad861a69edbddb2658";

export const getAddress = async (latitude, longitude) => {
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${MAPS_APIKEY}`;
    // console.log("Url:", url);
    const res = await fetch(url);
    return res;
  } catch (error) {
    console.log("Error getting address:", error.response);
    return error.response;
  }
};

export const getPath = async (origin, destination) => {
  console.log("Fetching path from", origin, "to", destination);
  try {
    const url = `https://api.geoapify.com/v1/routing?waypoints=${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}&mode=drive&apiKey=${MAPS_APIKEY}&units=imperial`;
    // console.log("Url:", url);
    const res = await fetch(url);
    return res;
  } catch (error) {
    console.log("Error getting waypoints:", error.response);
    return error.response;
  }
};

export const getAutoSuggestions = async (query) => {
  try {
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${MAPS_APIKEY}&limit=6`;
    // console.log("Url:", url);
    const res = await fetch(url);
    return res;
  } catch (error) {
    console.log("Error getting waypoints:", error.response);
    return error.response;
  }
};
