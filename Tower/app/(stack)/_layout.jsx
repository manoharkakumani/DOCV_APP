import { router, Stack, usePathname } from "expo-router";
import { IconButton } from "react-native-paper";
import Theme from "@/styles/Theme";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.light,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Theme.colors.dark,
        headerTitleStyle: {
          fontWeight: "bold",
          color: Theme.colors.dark,
        },
        headerLeft: () => (
          <IconButton
            icon="arrow-left"
            color="#071d7a"
            size={24}
            onPress={() => router.back()}
          />
        ),
      }}
    >
      <Stack.Screen name="payments" options={{ title: "Payments" }} />
      <Stack.Screen name="profile-edit" options={{ title: "Edit Profile" }} />
      <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
          headerRight: () => (
            <IconButton
              icon="bell"
              color="#071d7a"
              size={20}
              onPress={() => console.log("Notifications pressed")}
            />
          ),
        }}
      />
      <Stack.Screen name="booking-view" options={{ title: "Booking View" }} />
      <Stack.Screen name="chat" options={{ title: "Chat" }} />
      <Stack.Screen name="withdraw" options={{ title: "Withdraw Earnings" }} />
    </Stack>
  );
}
