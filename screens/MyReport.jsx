import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import config from "../config.json";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

export default function MyReport({ navigation }) {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [username, setUsername] = useState('');
  const [expanded, setExpanded] = useState({});
  const [activeTab, setActiveTab] = useState('MyReports');

  // Custom header with Notifications & Logout
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'My Reports',
      headerLeft: () => null,
      headerRight: () => (
        <View style={styles.headerButtons}>
          {/* Notification Button */}
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
          {/* Logout Button */}
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Text style={styles.iconText}>🚪</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  // Fetch Reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId'); // Get userId from storage
        if (!userId) {
          Alert.alert(t("Error"), t("User ID not found. Please log in again."));
          return;
        }

        const response = await axios.get(`${config.API_BASE_URL}/api/issue/requests/${userId}`);
        setReports(response.data);
      } catch (error) {
        console.error(t("Error fetching reports:"), error);
      }
    };

    fetchReports();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('userId'); // Remove userId as well
    navigation.replace('Login');
  };

  const toggleReadMore = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postTitle}>{item.name}</Text>
      <Image source={{ uri: `${config.API_BASE_URL}${item.photo}` }} style={styles.postImage} />
      <Text style={styles.postLocation}>{t('City')}: {item.city}, {t('Area')}: {item.area}</Text>
      
      <Text style={styles.postDescription}>
        {expanded[item._id] || item.description.length <= 100 
          ? item.description 
          : `${item.description.substring(0, 100)}... `}
        {item.description.length > 100 && (
          <Text style={styles.readMore} onPress={() => toggleReadMore(item._id)}>
            {expanded[item._id] ? t('Read Less') : t('Read More')}
          </Text>
        )}
      </Text>
      <Text style={styles.postStatus}>{t('status')}: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.scrollView}
      />

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navButton, activeTab === 'Home' && styles.activeButton]} 
          onPress={() => navigation.navigate('Home')}
        >
          <FontAwesome5 name="home" size={20} color={activeTab === 'Home' ? "#fff" : "#888"} />
          <Text style={[styles.navText, activeTab === 'Home' && styles.activeText]}>{t("Home")}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, activeTab === 'Reports' && styles.activeButton]} 
          onPress={() => navigation.navigate('Reports')}
        >
          <FontAwesome5 name="plus-circle" size={20} color={activeTab === 'Reports' ? "#fff" : "#888"} />
          <Text style={[styles.navText, activeTab === 'Reports' && styles.activeText]}>{t("Report")}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, activeTab === 'MyReports' && styles.activeButton]} 
          onPress={() => navigation.navigate('myReport')}
        >
          <FontAwesome5 name="file-alt" size={20} color={activeTab === 'MyReports' ? "#fff" : "#888"} />
          <Text style={[styles.navText, activeTab === 'MyReports' && styles.activeText]}>{t("My Reports")}</Text>
        </TouchableOpacity>
      </View>
    </View>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 15,
    marginRight: 15,
  },
  iconButton: {
    padding: 8,
    // backgroundColor: '#007BFF',
    borderRadius: 10,
  },
  iconText: {
    fontSize: 18,
    color: '#fff',
  },
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
  },
  postImage: {
    width: '100%',
    height: 350,
    borderRadius: 10,
    resizeMode: 'cover',
    marginVertical: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postLocation: {
    fontSize: 14,
    color: '#666',
    paddingBottom: 5,
  },
  postDescription: {
    fontSize: 14,
    color: '#555',
  },
  readMore: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  postStatus: {
    fontSize: 12,
    color: '#888',
    paddingBottom: 10,
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  navText: {
    fontSize: 12,
    color: '#888',
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

