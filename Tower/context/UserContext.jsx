import React, { createContext, useState, useContext } from "react";
import { useEffect } from "react";
import { getServiceProvider } from "@/utils/api";

import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext(null);

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setuser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      const value = JSON.parse(await AsyncStorage.getItem("user"));
      if (value) {
        const res = await getServiceProvider(value._id);
        if (res.status === 200) {
          setuser(res.data);
        } else {
          console.log(res.data);
          setuser(value);
        }
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

  const SetUser = async (user) => {
    await AsyncStorage.setItem("user", JSON.stringify(user));
    setuser(user);
  };

  return (
    <UserContext.Provider value={{ user, SetUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
};
