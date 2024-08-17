import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import { ServiceProviderSignup } from "../utils/api";
import { getLocationCoordinates } from "../utils/mapsapi";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      zipcode: "",
    },
    phone: "",
  });

  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setErrors({});
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.name) errors.name = "Full name is required";
    if (!data.email) errors.email = "Email address is required";
    if (!data.password) errors.password = "Password is required";
    if (data.password !== data.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    if (!data.address.line1) errors.line1 = "Address Line 1 is required";
    if (!data.address.city) errors.city = "City is required";
    if (!data.address.state) errors.state = "State is required";
    if (!data.address.zipcode) errors.zipcode = "Zip Code is required";
    if (!data.phone) errors.phone = "Phone number is required";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // Handle sign-up logic here
      const addressSearchString = `${formData.address.line1}+${formData.address.city}+${formData.address.state}+${formData.address.zipcode}`;
      const addressString = `${formData.address.line1}, ${formData.address.line2}, ${formData.address.city}, ${formData.address.state}, ${formData.address.zipcode}`;

      // get the coordinates from the address
      let location = await getLocationCoordinates(addressSearchString);

      if (location.length === 0) {
        setErrors({ address: "Invalid address" });
        return;
      } else {
        location = location[0];
      }

      const data = {
        ...formData,
        address: addressString,
        location: [location[0].lat, location[0].lon],
      };

      const response = await ServiceProviderSignup(data);

      if (response.status === 201) {
        dispatch(login(response.data));
      } else {
        setErrors({ email: "Email already exists" });
      }
    }
  };

  return auth.user ? (
    <Navigate to="/" />
  ) : (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8p-10 ">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="col-span-1 sm:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                name="name"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                name="password"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="address.line1"
                className="block text-sm font-medium text-gray-700"
              >
                Address Line 1
              </label>
              <input
                name="address.line1"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Address Line 1"
                value={formData.address.line1}
                onChange={handleChange}
              />
              {errors.line1 && (
                <p className="text-red-500 text-xs mt-1">{errors.line1}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="address.line2"
                className="block text-sm font-medium text-gray-700"
              >
                Address Line 2
              </label>
              <input
                name="address.line2"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Address Line 2"
                value={formData.address.line2}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="address.city"
                className="block text-sm font-medium text-gray-700"
              >
                City
              </label>
              <input
                name="address.city"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="City"
                value={formData.address.city}
                onChange={handleChange}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="address.state"
                className="block text-sm font-medium text-gray-700"
              >
                State
              </label>
              <input
                name="address.state"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="State"
                value={formData.address.state}
                onChange={handleChange}
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="address.zipcode"
                className="block text-sm font-medium text-gray-700"
              >
                Zip Code
              </label>
              <input
                name="address.zipcode"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Zip Code"
                value={formData.address.zipcode}
                onChange={handleChange}
              />
              {errors.zipcode && (
                <p className="text-red-500 text-xs mt-1">{errors.zipcode}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
