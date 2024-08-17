import { router, Stack, usePathname } from "expo-router";
import { IconButton } from "react-native-paper";
import Theme from "@/styles/Theme";
import { FabButton } from "@/components";

export default function StackLayout() {
  const pathname = usePathname();

  return (
    <>
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
        <Stack.Screen
          name="service-request"
          options={{ title: "Service Request" }}
        />
        <Stack.Screen name="towing" options={{ title: "Towing" }} />
        <Stack.Screen name="profile-edit" options={{ title: "Edit Profile" }} />
        <Stack.Screen name="vehicles" options={{ title: "Vehicles" }} />
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
        <Stack.Screen
          name="towing-tracking"
          options={{ title: "Towing Tracking" }}
        />
        <Stack.Screen name="booking-view" options={{ title: "Booking View" }} />
        <Stack.Screen name="add-vehicle" options={{ title: "Add Vehicle" }} />
        <Stack.Screen
          name="vehicle-details"
          options={{ title: "Vehicle Details" }}
        />
        <Stack.Screen name="chat" options={{ title: "Chat" }} />
        <Stack.Screen
          name="nearby-service-providers"
          options={{ title: "Nearby Service Providers" }}
        />
        <Stack.Screen
          name="service-provider-view"
          options={{ title: "Service Provider View" }}
        />
      </Stack>
      <FabButton currentRoute={pathname} />
    </>
  );
}
