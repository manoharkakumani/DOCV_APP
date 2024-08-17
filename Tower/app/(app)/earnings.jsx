import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { TabView, TabBar } from "react-native-tab-view";
import { useFocusEffect } from "@react-navigation/native";
import { useUserContext } from "@/context/UserContext";
import {
  getEarnings,
  getThisWeekEarnings,
  getLastWeekEarnings,
} from "@/utils/api";

import { router } from "expo-router";

const ThisWeekRoute = React.memo(({ data }) => (
  <ScrollView showsVerticalScrollIndicator={false}>
    {data.map((item, index) => (
      <Card key={index} style={styles.card}>
        <Card.Title
          title={item.date}
          right={(props) => (
            <Text style={styles.cardAmount}>${item.amount}</Text>
          )}
        />
      </Card>
    ))}
  </ScrollView>
));

const CustomRoute = React.memo(() => <Text>Custom Route</Text>);

const SummaryCard = React.memo(({ title, amount, buttonProps }) => (
  <Card style={styles.summaryCard}>
    <Card.Content>
      <Text>{title}</Text>
      <Text style={styles.amount}>${amount || 0}</Text>
      {buttonProps && <Button mode="contained" {...buttonProps} />}
    </Card.Content>
  </Card>
));

const Earnings = () => {
  const [index, setIndex] = useState(0);
  const { user } = useUserContext();
  const [earnings, setEarnings] = useState({});
  const [thisWeekEarnings, setThisWeekEarnings] = useState([]);
  const [lastWeekEarnings, setLastWeekEarnings] = useState([]);

  const routes = useMemo(
    () => [
      { key: "this_week", title: "This week" },
      { key: "last_week", title: "Last week" },
      { key: "custom", title: "Custom" },
    ],
    []
  );

  const fetchData = useCallback(async () => {
    try {
      if (!user) {
        router.replace("/(auth)/signin");
        return;
      }
      const id = user._id;

      const [res, thisWeek, lastWeek] = await Promise.all([
        getEarnings(id),
        getThisWeekEarnings(id),
        getLastWeekEarnings(id),
      ]);

      if (res.status === 200) setEarnings(res.data);
      if (thisWeek.status === 200)
        setThisWeekEarnings(thisWeek.data.thisWeekEarnings);
      if (lastWeek.status === 200)
        setLastWeekEarnings(lastWeek.data.lastWeekEarnings);
    } catch (error) {
      console.error("Fetch data error:", error);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const renderScene = useCallback(
    ({ route }) => {
      switch (route.key) {
        case "this_week":
          return <ThisWeekRoute data={thisWeekEarnings} />;
        case "last_week":
          return <ThisWeekRoute data={lastWeekEarnings} />;
        case "custom":
          return <CustomRoute />;
        default:
          return null;
      }
    },
    [thisWeekEarnings, lastWeekEarnings]
  );

  const renderTabBar = useCallback(
    (props) => (
      <TabBar
        {...props}
        indicatorStyle={styles.indicator}
        style={styles.tabBar}
        activeColor="#8f0f01"
        inactiveColor="#000"
      />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <SummaryCard title="Today's Earnings" amount={earnings.todayEarnings} />
        <SummaryCard
          title="Balance"
          amount={earnings.balance}
          buttonProps={{
            onPress: () =>
              router.push({
                pathname: "/withdraw",
                params: { balance: JSON.stringify(earnings.balance) },
              }),
            disabled: earnings.balance <= 0,
            children: "Withdraw",
          }}
        />
      </View>
      <View style={styles.summaryContainer}>
        <SummaryCard title="This Week" amount={earnings.thisWeekEarnings} />
        <SummaryCard title="This Month" amount={earnings.thisMonthEarnings} />
        <SummaryCard title="Total Earnings" amount={earnings.totalEarnings} />
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 360 }}
        renderTabBar={renderTabBar}
        style={styles.tabView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  summaryContainer: {
    flexDirection: "row",
    margin: 5,
  },
  summaryCard: {
    flex: 1,
    margin: 5,
    padding: 5,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  tabView: {
    marginHorizontal: 20,
  },
  tabBar: {
    backgroundColor: "#fff",
  },
  indicator: {
    backgroundColor: "#000",
  },
  card: {
    margin: 5,
    padding: 5,
    marginTop: 15,
  },
  cardAmount: {
    margin: 5,
    padding: 5,
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default Earnings;
