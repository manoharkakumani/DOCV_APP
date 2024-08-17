import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { Searchbar } from "react-native-paper";

const MapSarchBar = ({ apikey, selectedItem }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 3) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query
          )}&key=${apikey}&language=en`
        );
        const json = await response.json();
        setAutocompleteResults(json.predictions);
      } catch (error) {
        console.error(error);
      }
    } else {
      setAutocompleteResults([]);
    }
  };

  const handleSelectItem = async (item) => {
    setSearchQuery(item.description);
    setAutocompleteResults([]);
    await handelPlaceDetails(item.place_id);
  };

  const handelPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apikey}&language=en&fields=address_components,geometry,formatted_address,reference,plus_code`
      );
      const json = await response.json();
      selectedItem(json.result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search Destination"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={autocompleteResults}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectItem(item)}
            style={styles.listItem}
          >
            <Text>{item.description}</Text>
          </TouchableOpacity>
        )}
        style={styles.flatlist}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  searchBar: {
    marginBottom: 10,
  },
  listItem: {
    padding: 10,
    minHeight: 50,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  selected: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
  flatlist: {
    maxHeight: 200,
    backgroundColor: "white",
  },
});

export default MapSarchBar;
