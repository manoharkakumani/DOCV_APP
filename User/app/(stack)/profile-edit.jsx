import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import {
  TextInput,
  Avatar,
  IconButton,
  Text,
  Snackbar,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { updateUserField } from "@/utils/api"; // Assume this function exists

const ProfileEditScreen = () => {
  const { user, updateUser } = useUserContext();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(user.phone);
  const [avatar, setAvatar] = useState(
    user.avatar || require("@/assets/user.png")
  );

  const [editName, setEditName] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/signin");
    }
  }, [user]);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleUpdateField = async (field, value, setEditState) => {
    try {
      // const response = await updateUserField(user._id, field, value);
      if (false) {
        updateUser({ [field]: value });
        setEditState(false);
        showSnackbar(
          `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } updated successfully`
        );
      } else {
        showSnackbar(`Failed to update ${field}`);
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      showSnackbar(`Error updating ${field}`);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newAvatar = { uri: result.assets[0].uri };
      setAvatar(newAvatar);
      handleUpdateField("avatar", newAvatar, () => {});
    }
  };

  const renderEditableField = (
    label,
    value,
    setValue,
    editable,
    setEditable,
    icon,
    secureTextEntry = false
  ) => (
    <View style={styles.fieldContainer}>
      {editable ? (
        <TextInput
          label={label}
          value={value}
          onChangeText={setValue}
          mode="outlined"
          style={styles.input}
          secureTextEntry={secureTextEntry}
          left={
            <TextInput.Icon
              icon={() => <Ionicons name={icon} size={24} color="#3498db" />}
              size={24}
              color="#3498db"
              style={styles.icon}
            />
          }
          right={
            <TextInput.Icon
              icon={() => (
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      handleUpdateField(label.toLowerCase(), value, setEditable)
                    }
                  >
                    <Ionicons
                      name="checkmark"
                      size={24}
                      color="#3498db"
                      style={styles.saveIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setEditable(false);
                      setValue(user[label.toLowerCase()]);
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color="#3498db"
                      style={styles.cancleIcon}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          }
        />
      ) : (
        <View style={styles.textContainer}>
          <Ionicons name={icon} size={24} color="#3498db" style={styles.icon} />
          <Text style={styles.fieldText}>
            {secureTextEntry ? "••••••••" : value}
          </Text>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => setEditable(true)}
          />
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Avatar.Image size={120} source={avatar} />
          <View style={styles.editIconContainer}>
            <Ionicons name="camera" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.form}>
        {renderEditableField(
          "Name",
          name,
          setName,
          editName,
          setEditName,
          "person-outline"
        )}
        {renderEditableField(
          "Email",
          email,
          setEmail,
          editEmail,
          setEditEmail,
          "mail-outline"
        )}
        {renderEditableField(
          "Phone",
          phone,
          setPhone,
          editPhone,
          setEditPhone,
          "call-outline"
        )}
        {renderEditableField(
          "Password",
          password,
          setPassword,
          editPassword,
          setEditPassword,
          "lock-closed-outline",
          true
        )}
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: "#3498db" }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: "#3498db",
  },
  avatarContainer: {
    position: "relative",
  },
  editIconContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#2ecc71",
    borderRadius: 20,
    padding: 8,
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 8,
  },
  icon: {
    marginRight: 10,
  },
  fieldText: {
    flex: 1,
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: "row",
    padding: 8,

    justifyContent: "space-between",
  },
  saveIcon: {
    // marginRight: 10,
    // right: 20,
  },
  cancleIcon: {
    // left: 20,
  },
});

export default ProfileEditScreen;
