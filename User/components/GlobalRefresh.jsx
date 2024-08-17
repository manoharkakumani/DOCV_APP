import React, { useState, useCallback } from "react";
import { RefreshControl, ScrollView, View, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

const GlobalRefresh = ({ children, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  // List of screens where ScrollView should not be used
  const noScrollViewScreens = ["TowingTracking", "Map"];

  if (noScrollViewScreens.includes(route.name)) {
    return (
      <View style={styles.container}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { onRefresh: handleRefresh, refreshing })
        )}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.container}>{children}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default GlobalRefresh;
