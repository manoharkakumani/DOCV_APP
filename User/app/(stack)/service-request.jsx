import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Button,
  TextInput,
  List,
  Divider,
  Portal,
  Modal,
  Checkbox,
  Text,
  Chip,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { getCustomerVehicles, addBooking } from "@/utils/api";

import { useUserContext } from "@/context/UserContext";

import { router, useLocalSearchParams } from "expo-router";

const ServiceRequest = () => {
  const { serviceProvider: serviceProviderString } = useLocalSearchParams();
  const serviceProvider = JSON.parse(serviceProviderString);
  const { user } = useUserContext();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedServices, setSelectedServices] = useState({});
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    fetchUserVehicles();
  }, [serviceProvider]);

  const fetchUserVehicles = async () => {
    try {
      const response = await getCustomerVehicles(user._id);
      if (response.status === 200) {
        setVehicles(response.data);
        if (response.data.length > 0) {
          setSelectedVehicle(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching user vehicles:", error);
      Alert.alert("Error", "Failed to fetch your vehicles. Please try again.");
    }
  };

  const toggleService = (serviceId) => {
    setSelectedServices((prevState) => ({
      ...prevState,
      [serviceId]: !prevState[serviceId],
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const calculateTotalCost = () => {
    return serviceProvider.services.reduce((total, service) => {
      if (selectedServices[service.id]) {
        return total + service.price;
      }
      return total;
    }, 0);
  };

  const handleBooking = async () => {
    const selectedServiceIds = Object.keys(selectedServices).filter(
      (id) => selectedServices[id]
    );
    if (selectedServiceIds.length === 0) {
      Alert.alert("Error", "Please select at least one service.");
      return;
    }

    if (!selectedVehicle) {
      Alert.alert("Error", "Please select a vehicle.");
      return;
    }

    const bookingData = {
      customerId: user._id,
      serviceProviderId: serviceProvider._id,
      vehicleId: selectedVehicle,
      services: serviceProvider.services.filter((service) =>
        selectedServiceIds.includes(service.id.toString())
      ),
      date: date.toISOString(),
      notes: notes,
    };
    try {
      const response = await addBooking(bookingData);
      if (response.status === 201) {
        Alert.alert("Success", "Your booking has been confirmed!", [
          { text: "OK", onPress: () => router.replace("/bookings") },
        ]);
      }
    } catch (error) {
      console.error("Error booking service:", error);
      Alert.alert("Error", "Failed to book the service. Please try again.");
    }
  };

  const ServiceSelectionModal = () => (
    <Portal>
      <Modal
        visible={showServiceModal}
        onDismiss={() => setShowServiceModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={styles.modalTitle}>Select Services</Text>
        <ScrollView>
          {serviceProvider.services.map((service) => (
            <List.Item
              key={service.id}
              title={service.name}
              description={`$${service.price.toFixed(2)}`}
              left={(props) => <List.Icon {...props} icon="car-wrench" />}
              right={() => (
                <Checkbox
                  status={
                    selectedServices[service.id] ? "checked" : "unchecked"
                  }
                  onPress={() => toggleService(service.id)}
                />
              )}
            />
          ))}
        </ScrollView>
        <Button
          mode="contained"
          onPress={() => setShowServiceModal(false)}
          style={styles.modalButton}
        >
          Done
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.serviceProviderDetails}>
          <Text style={styles.providerName}>{serviceProvider.name}</Text>
          <Text style={styles.providerAddress}>{serviceProvider.address}</Text>
          <Text style={styles.providerPhone}>{serviceProvider.phone}</Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Vehicle</Text>
          <Picker
            selectedValue={selectedVehicle}
            onValueChange={(itemValue) => setSelectedVehicle(itemValue)}
            style={styles.picker}
          >
            {vehicles.map((vehicle) => (
              <Picker.Item
                key={vehicle._id}
                label={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
                value={vehicle._id}
              />
            ))}
          </Picker>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Services</Text>
          <View style={styles.chipContainer}>
            {Object.keys(selectedServices).map((serviceId) => {
              const service = serviceProvider.services.find(
                (s) => s.id == serviceId
              );
              if (service && selectedServices[serviceId]) {
                return (
                  <Chip
                    key={serviceId}
                    onClose={() => toggleService(serviceId)}
                    style={styles.chip}
                  >
                    {service.name}
                  </Chip>
                );
              }
              return null;
            })}
          </View>
          <Button
            mode="outlined"
            onPress={() => setShowServiceModal(true)}
            icon="plus"
            style={styles.addServiceButton}
          >
            Add Services
          </Button>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Button
            onPress={() => setShowDatePicker(true)}
            mode="outlined"
            icon="calendar"
            style={styles.dateButton}
          >
            {date.toLocaleDateString()}
          </Button>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            mode="outlined"
            style={styles.notesInput}
          />
        </View>

        <View style={styles.totalCostContainer}>
          <Text style={styles.totalCostLabel}>Total Cost:</Text>
          <Text style={styles.totalCostValue}>
            ${calculateTotalCost().toFixed(2)}
          </Text>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleBooking}
          style={styles.bookButton}
          icon="check"
        >
          Book Service
        </Button>
      </View>
      <ServiceSelectionModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 150,
  },
  serviceProviderDetails: {
    marginBottom: 24,
  },
  providerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  providerAddress: {
    fontSize: 16,
    color: "#666",
    marginBottom: 2,
  },
  providerPhone: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  divider: {
    marginBottom: 24,
    backgroundColor: "#e0e0e0",
  },
  dateButton: {
    marginTop: 8,
  },
  notesInput: {
    marginTop: 8,
    backgroundColor: "#fff",
  },
  totalCostContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    padding: 16,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
  },
  totalCostLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  totalCostValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  bookButton: {
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  divider: {
    marginBottom: 24,
    backgroundColor: "#e0e0e0",
  },
  dateButton: {
    marginTop: 8,
  },
  notesInput: {
    marginTop: 8,
    backgroundColor: "#fff",
  },
  totalCostContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    padding: 16,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
  },
  totalCostLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  totalCostValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  bookButton: {
    marginTop: 8,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  modalButton: {
    marginTop: 16,
  },
  picker: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    color: "#000",
  },
  chip: {
    margin: 4,
  },
  addServiceButton: {
    marginTop: 8,
  },
});

export default ServiceRequest;
