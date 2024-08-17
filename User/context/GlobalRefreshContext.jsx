import React, { createContext, useState, useContext, useCallback } from "react";

const GlobalRefreshContext = createContext();

export const useGlobalRefresh = () => useContext(GlobalRefreshContext);

export const GlobalRefreshProvider = ({ children, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  return (
    <GlobalRefreshContext.Provider
      value={{ refreshing, onRefresh: handleRefresh }}
    >
      {children}
    </GlobalRefreshContext.Provider>
  );
};
