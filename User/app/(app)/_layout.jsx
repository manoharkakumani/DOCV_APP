import { Tabs, usePathname } from "expo-router";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Theme from "@/styles/Theme";
import { FabButton } from "@/components";

const TabBarButton = ({ children, onPress }) => (
  <TouchableOpacity style={styles.tabBarButton} onPress={onPress}>
    {children}
  </TouchableOpacity>
);

export default function AppLayout() {
  const pathname = usePathname();
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "activity") {
              iconName = "history";
            } else if (route.name === "bookings") {
              iconName = "calendar";
            } else if (route.name === "profile") {
              iconName = focused ? "account" : "account-outline";
            } else if (route.name === "test") {
              iconName = "test-tube";
            }
            return (
              <MaterialCommunityIcons
                name={iconName}
                size={size + 5}
                color={color}
              />
            );
          },
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarActiveTintColor: Theme.colors.primary,
          tabBarInactiveTintColor: Theme.colors.gray,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: "Activity",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>
      <FabButton currentRoute={pathname} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    height: 65,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    left: 2,
    right: 2,
    backgroundColor: Theme.colors.white,
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  tabBarButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBarLabel: {
    fontSize: 12,
    bottom: 15,
  },
});
