import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { Searchbar } from "react-native-paper";

import { getAutoSuggestions } from "@/utils/mapsapi";

const MapSarchBar = ({ selectedItem }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 3) {
      try {
        const response = await getAutoSuggestions(query);
        if (response.status === 200) {
          const json = await response.json();
          setAutocompleteResults(json.features);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setAutocompleteResults([]);
    }
  };

  const handleSelectItem = async (item) => {
    setSearchQuery(item.properties.formatted);
    setAutocompleteResults([]);
    selectedItem(item);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search Destination"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      {searchQuery.length > 3 && (
        <FlatList
          data={autocompleteResults}
          keyExtractor={(item) => item.properties.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectItem(item)}
              style={styles.listItem}
            >
              <Text>{item.properties.formatted}</Text>
            </TouchableOpacity>
          )}
          style={styles.flatlist}
        />
      )}
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
