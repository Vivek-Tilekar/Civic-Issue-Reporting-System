import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function Issue({ navigation }) {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [data, setData] = useState([]);

  // Function to request permissions
  const requestPermissions = async () => {
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      Alert.alert("Permission Denied", "Location permission is required to proceed.");
      return false;
    }
    return true;
  };

  // Function to get current location
  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Error getting location: ", error);
    }
  };

  // Function to fetch nearby issues
  const fetchData = async () => {
    try {
      if (location.latitude && location.longitude) {
        const response = await axios.get('http://192.168.31.12:3000/api/issue/requests/nearby', {
          params: { latitude: location.latitude, longitude: location.longitude, radius: 5 }
        });
        setData(response.data.data); // Access nested data array
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    (async () => {
      const hasPermissions = await requestPermissions();
      if (hasPermissions) {
        await getCurrentLocation();
      }
    })();
  }, []);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchData();
    }
  }, [location]);

  const handleStatusChange = (id, newStatus) => {
    const updatedData = data.map((item) =>
      item._id === id ? { ...item, status: newStatus } : item
    );
    setData(updatedData);

    axios.put(`http://192.168.165.143:3000/api/issue/requests`, { id, status: newStatus })
      .then(() => console.log('Status updated successfully'))
      .catch((error) => console.error('Error updating status:', error));
  };

  const renderRow = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.phoneNo}</Text>
      <View style={styles.needsContainer}>
        {item.needs.map((need, index) => (
          <Text key={index} style={styles.needItem}>{need}</Text>
        ))}
      </View>
      <Picker
        selectedValue={item.status}
        style={styles.picker}
        onValueChange={(value) => handleStatusChange(item._id, value)}
      >
        <Picker.Item label="Pending" value="pending" />
        <Picker.Item label="In Progress" value="in-progress" />
        <Picker.Item label="Completed" value="completed" />
      </Picker>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Name</Text>
        <Text style={styles.headerCell}>Phone Number</Text>
        <Text style={styles.headerCell}>Needs</Text>
        <Text style={styles.headerCell}>Status</Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderRow}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  needsContainer: {
    flex: 2,
    flexDirection: 'column',
    alignItems: 'center',
  },
  needItem: {
    fontSize: 12,
    color: '#555',
  },
  picker: {
    flex: 1,
    height: 50,
    width: '100%',
  },
});
