import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
    user: null,
    bookingId: null,
  },
  reducers: {
    login: (state, action) => {
      console.log(action.payload);
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    setBookingId: (state, action) => {
      state.bookingId = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.bookingId = null;
    },
  },
});

export const { login, logout, setBookingId } = authSlice.actions;

export default authSlice.reducer;
