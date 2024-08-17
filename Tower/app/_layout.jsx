import { Slot } from "expo-router";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@react-navigation/native";
import { WebSocketProvider } from "@/context/WebSocketProvider";
import { GlobalRefreshProvider } from "@/context/GlobalRefreshContext";
import Theme from "@/styles/Theme";

export default function RootLayout() {
  return (
    <ThemeProvider value={Theme}>
      <UserProvider>
        <WebSocketProvider>
          <GlobalRefreshProvider>
            <Slot />
          </GlobalRefreshProvider>
        </WebSocketProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
