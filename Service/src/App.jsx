import React from "react";
import Navigation from "./Navigation/Navigation";
import { WebSocketProvider } from "./context/WebSocketProvider";
// import Sidebar from "./components/Sidebar"; // We'll create this later

const App = () => {
  return (
    <WebSocketProvider>
      <Navigation />
    </WebSocketProvider>
  );
};

export default App;
