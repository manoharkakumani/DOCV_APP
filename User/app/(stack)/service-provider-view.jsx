import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Card, Divider, List, Avatar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/styles/Theme";
import { useLocalSearchParams, router } from "expo-router";

const ServiceProviderView = () => {
  const { serviceProvider: serviceProviderString } = useLocalSearchParams();
  const serviceProvider = JSON.parse(serviceProviderString);
  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={{}}>
          <View style={styles.header}>
            <Avatar.Image
              size={80}
              source={{ uri: "https://example.com/default-avatar.png" }} // Replace with actual avatar
            />
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{serviceProvider.name}</Text>
            </View>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.detailsContainer}>
            <DetailItem icon="call" value={serviceProvider.phone} />
            <DetailItem icon="mail" value={serviceProvider.email} />
            <DetailItem icon="location" value={serviceProvider.address} />
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Services Offered</Text>
          {serviceProvider.services.map((service) => (
            <List.Item
              key={service.id}
              title={service.name}
              description={`$${service.price.toFixed(2)}`}
              left={(props) => <List.Icon {...props} icon="wrench" />}
              style={styles.serviceItem}
            />
          ))}
        </Card>
      </ScrollView>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/booking",
            params: { serviceProvider: JSON.stringify(serviceProvider) },
          })
        }
        style={styles.chatButton}
      >
        <Text style={styles.chatButtonText}>Book Service</Text>
      </TouchableOpacity>
    </View>
  );
};

const DetailItem = ({ icon, value }) => (
  <View style={styles.detailItem}>
    <Ionicons
      name={icon}
      size={24}
      color={Theme.colors.primary}
      style={styles.detailIcon}
    />
    <View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  card: {
    margin: Theme.margin.md,
    borderRadius: Theme.radius.md,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    padding: Theme.padding.md,
    alignItems: "center",
  },
  headerInfo: {
    marginLeft: Theme.margin.md,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.text,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  divider: {
    marginVertical: Theme.margin.sm,
  },
  detailsContainer: {
    padding: Theme.padding.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.margin.sm,
  },
  detailIcon: {
    marginRight: Theme.margin.sm,
  },

  detailValue: {
    fontSize: 16,
    color: Theme.colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Theme.colors.primary,
    padding: Theme.padding.md,
  },
  serviceItem: {
    paddingVertical: Theme.padding.sm,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  chatButtonText: {
    color: Theme.colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ServiceProviderView;
