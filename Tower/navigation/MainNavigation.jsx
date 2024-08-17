import React, { useContext, useEffect } from "react";
import { useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { IconButton } from "react-native-paper";

import { useUserContext } from "../context/UserContext";

import {
  Home,
  Earnings,
  Profile,
  Payments,
  Activity,
  Splash,
  AddCard,
  Notifications,
  SignIn,
  SignUp,
  Chat,
  SomethingWentWrong,
  CheckInternetConnection,
  BookingView,
  Withdraw,
} from "../screens";
import Theam from "../screens/Theam";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabBarButton = ({ children, onPress }) => (
  <TouchableOpacity style={styles.tabBarButton} onPress={onPress}>
    {children}
  </TouchableOpacity>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Activity") {
            iconName = "history";
          } else if (route.name === "Earnings") {
            iconName = "currency-usd";
          } else if (route.name === "Profile") {
            iconName = focused ? "account" : "account-outline";
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
        tabBarActiveTintColor: Theam.colors.primary,
        tabBarInactiveTintColor: Theam.colors.gray,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Activity" component={Activity} />
      <Tab.Screen name="Earnings" component={Earnings} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

const MainNavigation = () => {
  const { SetUser } = useUserContext();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const unsubscribe = navigationRef.addListener("state", (e) => {
      const state = e.data.state;
      const routeNames = state.routeNames;
      const currentRoute = routeNames[state.index];

      if (currentRoute === "Login") {
        SetUser(null);
      }
    });

    return unsubscribe;
  }, [navigationRef]);

  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen
        name="Splash"
        component={Splash}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerTitle: "DOCV" }}
      />
      <Stack.Screen name="Payments" component={Payments} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Activity" component={Activity} />
      <Stack.Screen name="AddCard" component={AddCard} />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{
          headerTitle: "Notifications",
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
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="BookingView" component={BookingView} />
      <Stack.Screen
        name="SomethingWentWrong"
        component={SomethingWentWrong}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CheckInternetConnection"
        component={CheckInternetConnection}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Withdraw" component={Withdraw} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    height: 75,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    left: 2,
    right: 2,
    backgroundColor: Theam.colors.white,
    ...Platform.select({
      ios: {
        shadowColor: Theam.colors.black,
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

export default MainNavigation;
