import React, { createContext, useState, useContext } from "react";
import { useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext(null);

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setuser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      console.log("Fetching user...");
      const value = JSON.parse(await AsyncStorage.getItem("user"));
      console.log("User fetched:", value);
      if (value) {
        setuser(value);
      }
    };
    fetchUser();
    console.log("UserContext Provider mounted");
    return () => {
      console.log("UserContext Provider unmounted");
    };
  }, []);

  const signOut = () => {
    console.log("Signing out...");
    AsyncStorage.removeItem("user");
    setuser(null);
  };

  const setUser = async (user) => {
    await AsyncStorage.setItem("user", JSON.stringify(user));
    setuser(user);
    console.log("User set:", user);
  };

  return (
    <UserContext.Provider value={{ user, setUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
};
