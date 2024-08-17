//nominatim.openstreetmap.org/search.php?q=810+chestnut+st+erie+pa&format=jsonv2
// https://api.geoapify.com/v1/routing?waypoints=42.123979,-80.092437|42.7404663,-78.8489216&mode=drive&apiKey=b8568cb9afc64fad861a69edbddb2658&units=imperial

// https: b8568cb9afc64fad861a69edbddb2658;

import axios from "axios";

export const getLocationCoordinates = async (address) => {
  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search.php?q=${address}&format=jsonv2`
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
