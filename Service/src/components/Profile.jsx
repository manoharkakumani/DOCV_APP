import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import NavBar from "./Navbar";
import { updateUserProfile } from "../utils/api";
import { login, logout } from "../store/authSlice";
import { getLocationCoordinates } from "../utils/mapsapi";

const Profile = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      zipcode: "",
    },
  });

  const [editing, setEditing] = useState({});
  const [tempInput, setTempInput] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth.user) {
      const [line1, line2, city, state, zipcode] =
        auth.user.address.split(", ");
      setProfile({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone,
        password: "",
        address: { line1, line2, city, state, zipcode },
      });
    }
  }, [auth.user]);

  const handleEdit = (field) => {
    setEditing({ ...editing, [field]: true });
    setTempInput({ ...tempInput, [field]: profile[field] });
  };

  const handleChange = (e, field) => {
    if (field === "address") {
      setTempInput({
        ...tempInput,
        address: { ...tempInput.address, [e.target.name]: e.target.value },
      });
    } else {
      setTempInput({ ...tempInput, [field]: e.target.value });
    }
  };

  const validateField = (field, value) => {
    const errors = {};

    switch (field) {
      case "name":
        if (!value.trim()) errors.name = "Full name is required";
        break;
      case "email":
        if (!value.trim()) errors.email = "Email address is required";
        // You might want to add email format validation here
        break;
      case "password":
        if (!value) errors.password = "Password is required";
        break;
      case "address":
        if (!value.line1.trim()) errors.line1 = "Address Line 1 is required";
        if (!value.city.trim()) errors.city = "City is required";
        if (!value.state.trim()) errors.state = "State is required";
        if (!value.zipcode.trim()) errors.zipcode = "Zip Code is required";
        break;
      case "phone":
        if (!value.trim()) errors.phone = "Phone number is required";
        break;
      default:
        break;
    }

    return errors;
  };

  const handleSave = async (field) => {
    setLoading(true);
    setError(null);

    // Validate the field
    const validationErrors = validateField(field, tempInput[field]);
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      setTimeout(() => setError(null), 3000); // Clear message after 3 seconds
      setLoading(false);
      return;
    }

    try {
      let updatedData;
      if (field === "address") {
        const { line1, line2, city, state, zipcode } = tempInput.address;
        const addressString = `${line1}, ${line2}, ${city}, ${state}, ${zipcode}`;
        const addressSearchString = `${line1}+${city}+${state}+${zipcode}`;

        // Get coordinates for the address
        let location = await getLocationCoordinates(addressSearchString);

        if (location.length === 0) {
          setErrors({ address: "Invalid address" });
          setTimeout(() => setError(null), 3000); // Clear message after 3 seconds
          setLoading(false);
          return;
        } else {
          location = location;
        }
        console.log(location);
        updatedData = {
          address: addressString,
          location: [location[0].lat, location[0].lon],
        };
      } else {
        updatedData = { [field]: tempInput[field] };
      }

      const response = await updateUserProfile(auth.user._id, updatedData);
      if (response.status === 200) {
        // Update local state
        if (field === "address") {
          setProfile((prevProfile) => ({
            ...prevProfile,
            address: {
              line1: tempInput.address.line1,
              line2: tempInput.address.line2,
              city: tempInput.address.city,
              state: tempInput.address.state,
              zipcode: tempInput.address.zipcode,
            },
          }));
        } else {
          setProfile((prevProfile) => ({
            ...prevProfile,
            [field]: tempInput[field],
          }));
        }

        setEditing({ ...editing, [field]: false });

        // Update Redux state and local storage
        const updatedUser = {
          ...auth.user,
          ...updatedData,
        };
        if (field === "address") {
          updatedUser.address = updatedData.address;
        }
        dispatch(login(updatedUser));

        // If email or password changed, logout
        if (field === "email" || field === "password") {
          setTimeout(() => {
            dispatch(logout());
            navigate("/");
          }, 1000); // Delay logout for 1 second to show success message
        }

        // Show success message
        setError("Profile updated successfully!");
        setTimeout(() => setError(null), 3000); // Clear message after 3 seconds
      }
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    }
    setLoading(false);
  };

  const handleCancel = (field) => {
    setEditing({ ...editing, [field]: false });
  };

  const renderField = (field, label) => {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {label}
        </label>
        <div className="flex items-center">
          {editing[field] ? (
            <>
              <input
                type={field === "password" ? "password" : "text"}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                value={tempInput[field] || ""}
                onChange={(e) => handleChange(e, field)}
              />
              <button
                onClick={() => handleSave(field)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
              >
                Save
              </button>
              <button
                onClick={() => handleCancel(field)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className="mr-2 flex-grow">{profile[field]}</span>
              <button
                onClick={() => handleEdit(field)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderAddress = () => {
    const addressString = `${profile.address.line1}, ${profile.address.line2}, ${profile.address.city}, ${profile.address.state}, ${profile.address.zipcode}`;

    return (
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Address
        </label>
        <div className="flex items-center">
          {editing.address ? (
            <div className="w-full">
              <input
                type="text"
                name="line1"
                placeholder="Address Line 1"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                value={tempInput.address.line1}
                onChange={(e) => handleChange(e, "address")}
              />
              <input
                type="text"
                name="line2"
                placeholder="Address Line 2"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                value={tempInput.address.line2}
                onChange={(e) => handleChange(e, "address")}
              />
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={tempInput.address.city}
                  onChange={(e) => handleChange(e, "address")}
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={tempInput.address.state}
                  onChange={(e) => handleChange(e, "address")}
                />
                <input
                  type="text"
                  name="zipcode"
                  placeholder="Zip Code"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={tempInput.address.zipcode}
                  onChange={(e) => handleChange(e, "address")}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleSave("address")}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => handleCancel("address")}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="mr-2 flex-grow">{addressString}</span>
              <button
                onClick={() => handleEdit("address")}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <NavBar />
      <div className="max-w-2xl mx-auto mt-10 p-6 rounded-lg">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {loading && (
          <div className="text-center mb-4">
            <p>Updating profile...</p>
          </div>
        )}
        <div className="space-y-4">
          {renderField("name", "Full Name")}
          {renderField("email", "Email")}
          {renderField("phone", "Phone")}
          {renderField("password", "Password")}
          {renderAddress()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
