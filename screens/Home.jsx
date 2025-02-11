import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import RNPickerSelect from 'react-native-picker-select';
import * as Location from 'expo-location';
import axios from 'axios';
import config from "../config.json";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home({ navigation }) {
  const { t, i18n } = useTranslation();
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [data, setData] = useState([]);
  const [username, setUsername] = useState('');
  const [expanded, setExpanded] = useState({});

  const requestPermissions = async () => {
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      Alert.alert(t("Permission Denied"), t("Location permission is required to proceed."));
      return false;
    }
    return true;
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error(t("Error getting location:"), error);
    }
  };

  useEffect(() => {
    const fetchUsername = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };
    fetchUsername();
  }, []);

  const fetchData = async () => {
    try {
      if (location.latitude && location.longitude) {
        const response = await axios.get(`${config.API_BASE_URL}/api/issue/requests/nearby`, {
          params: { latitude: location.latitude, longitude: location.longitude, radius: 5 },
        });
        setData(response.data.data);
      }
    } catch (error) {
      console.error(t("Error fetching data:"), error);
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

  const toggleReadMore = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postTitle}>{item.name}</Text>
      <Image source={{ uri: `${config.API_BASE_URL}${item.photo}` }} style={styles.postImage} />
      <Text style={styles.postLocation}>{t('City')}: {item.city}, {t('Area')}: {item.area}</Text>
      
      <Text style={styles.postDescription}>
        {expanded[item.id] || item.description.length <= 100 
          ? item.description 
          : `${item.description.substring(0, 100)}... `}
        {item.description.length > 100 && (
          <Text style={styles.readMore} onPress={() => toggleReadMore(item.id)}>
            {expanded[item.id] ? t('Read Less') : t('Read More')}
          </Text>
        )}
      </Text>
      <Text style={styles.postStatus}>{t('status')}: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <RNPickerSelect
        onValueChange={(value) => i18n.changeLanguage(value)}
        items={[
          { label: 'English', value: 'en' },
          { label: 'Gujarati', value: 'gn' },
          { label: 'Hindi', value: 'hn' },
        ]}
      />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.scrollView}
      />
      <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('Reports')}>
        <Text style={styles.reportButtonText}>{t("report")}</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
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
  reportButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    margin: 15,
    elevation: 5,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


// import React, { useEffect, useState } from 'react';
// import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
// import { useTranslation } from 'react-i18next';
// import RNPickerSelect from 'react-native-picker-select';
// import * as Location from 'expo-location';
// import axios from 'axios';
// import config from "../config.json";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function Home({ navigation }) {
//   const { t, i18n } = useTranslation();
//   const [location, setLocation] = useState({ latitude: null, longitude: null });
//   const [data, setData] = useState([]);
//   const [username, setUsername] = useState('');

//   const requestPermissions = async () => {
//     const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
//     if (locationStatus !== 'granted') {
//       Alert.alert(t("Permission Denied"), t("Location permission is required to proceed."));
//       return false;
//     }
//     return true;
//   };

//   const getCurrentLocation = async () => {
//     try {
//       const location = await Location.getCurrentPositionAsync({});
//       setLocation({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       });
//     } catch (error) {
//       console.error(t("Error getting location:"), error);
//     }
//   };

//   useEffect(() => {
//     const fetchUsername = async () => {
//       const storedUsername = await AsyncStorage.getItem('username');
//       if (storedUsername) {
//         setUsername(storedUsername);
//       }
//     };

//     fetchUsername();
//   }, []);

//   const fetchData = async () => {
//     try {
//       if (location.latitude && location.longitude) {
//         const response = await axios.get(`${config.API_BASE_URL}/api/issue/requests/nearby`, {
//           params: { latitude: location.latitude, longitude: location.longitude, radius: 5 },
//         });
//         setData(response.data.data);
//       }
//     } catch (error) {
//       console.error(t("Error fetching data:"), error);
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       const hasPermissions = await requestPermissions();
//       if (hasPermissions) {
//         await getCurrentLocation();
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     if (location.latitude && location.longitude) {
//       fetchData();
//     }
//   }, [location]);

//   const renderItem = ({ item }) => (
//     <View style={styles.postContainer}>
//       <Text style={styles.postTitle}>{item.name}</Text>
//       <Image source={{ uri: `${config.API_BASE_URL}${item.photo}` }} style={styles.postImage} />

//       {/* <Text style={styles.postDescription}>{`${config.API_BASE_URL}${item.photo}`}</Text> */}
//       <Text style={styles.postDescription}>{'Description'} : {item.description}</Text>
//       <Text style={styles.postStatus}>{t('status')}: {item.status}</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <RNPickerSelect
//         onValueChange={(value) => i18n.changeLanguage(value)}
//         items={[
//           { label: 'English', value: 'en' },
//           { label: 'Gujarati', value: 'gn' },
//           { label: 'Hindi', value: 'hn' },
//         ]}
//       />
//       <FlatList
//         data={data}
//         renderItem={renderItem}
//         keyExtractor={(item, index) => index.toString()}
//         contentContainerStyle={styles.scrollView}
//       />
//       <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('Reports')}>
//         <Text style={styles.reportButtonText}>{t("report")}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   scrollView: {
//     padding: 10,
//   },
//   postContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 15,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     marginBottom: 20,
//   },
//   postImage: {
//     width: '95%',
//     height: 300,
//     borderRadius: 10,
//     resizeMode: 'cover',
//     marginVertical: 10,
//     marginHorizontal: 7
//   },
//   postTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     padding: 10,
//   },
//   postDescription: {
//     fontSize: 14,
//     color: '#555',
//     paddingHorizontal: 10,
//     paddingBottom: 5,
//   },
//   postStatus: {
//     fontSize: 12,
//     color: '#888',
//     paddingHorizontal: 10,
//     paddingBottom: 10,
//   },
//   reportButton: {
//     backgroundColor: '#E74C3C',
//     paddingVertical: 12,
//     borderRadius: 25,
//     alignItems: 'center',
//     margin: 15,
//     elevation: 5,
//   },
//   reportButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });


// IMP
// import React, { useEffect, useState } from 'react';
// import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
// import { useTranslation } from 'react-i18next';
// import RNPickerSelect from 'react-native-picker-select';
// import * as Location from 'expo-location';
// import axios from 'axios';
// import config from "../config.json";

// export default function Home({ navigation }) {
//   const { t, i18n } = useTranslation();
//   const [location, setLocation] = useState({ latitude: null, longitude: null });
//   const [data, setData] = useState([]);

//   const requestPermissions = async () => {
//     const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
//     if (locationStatus !== 'granted') {
//       Alert.alert(t("Permission Denied"), t("Location permission is required to proceed."));
//       return false;
//     }
//     return true;
//   };

//   const getCurrentLocation = async () => {
//     try {
//       const location = await Location.getCurrentPositionAsync({});
//       setLocation({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       });
//     } catch (error) {
//       console.error(t("Error getting location:"), error);
//     }
//   };

//   const fetchData = async () => {
//     try {
//       if (location.latitude && location.longitude) {
//         const response = await axios.get(`${config.API_BASE_URL}/api/issue/requests/nearby`, {
//           params: { latitude: location.latitude, longitude: location.longitude, radius: 5 },
//         });
//         setData(response.data.data);
//       }
//     } catch (error) {
//       console.error(t("Error fetching data:"), error);
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       const hasPermissions = await requestPermissions();
//       if (hasPermissions) {
//         await getCurrentLocation();
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     if (location.latitude && location.longitude) {
//       fetchData();
//     }
//   }, [location]);

//   // const txt = `${config.API_BASE_URL}/${item.imagePath}`;

//   const renderItem = ({ item }) => (
//     <View style={styles.postContainer}>
//       <Image source={{ uri: `${config.API_BASE_URL}${item.photo}` }} style={styles.postImage} />
//       <Text style={styles.postText}>{`${config.API_BASE_URL}${item.photo}`}</Text>
//       <Text style={styles.postTitle}>{item.name}</Text>
//       <Text style={styles.postText}>{t('phone')}: {item.phoneNo}</Text>
//       <Text style={styles.postText}>{t('description')}: {item.description}</Text>
//       <Text style={styles.postText}>{t('status')}: {item.status}</Text>
//       <Text style={styles.postText}>{t('location')}: Lat {item.latitude}, Lon {item.longitude}</Text>
//       <Text style={styles.postText}>{t('needs')}: {item.needs.join(', ')}</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <RNPickerSelect
//         onValueChange={(value) => i18n.changeLanguage(value)}
//         items={[
//           { label: 'English', value: 'en' },
//           { label: 'Gujarati', value: 'gn' },
//           { label: 'Hindi', value: 'hn' },
//         ]}
//       />
//       <FlatList
//         data={data}
//         renderItem={renderItem}
//         keyExtractor={(item, index) => index.toString()}
//         contentContainerStyle={styles.scrollView}
//       />
//       <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('Reports')}>
//         <Text style={styles.reportButtonText}>{t("report")}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   scrollView: {
//     padding: 10,
//   },
//   postContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 15,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   postImage: {
//     width: '100%',
//     height: 250,
//     resizeMode: 'cover',
//   },
//   postTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     padding: 10,
//   },
//   postText: {
//     fontSize: 14,
//     color: '#555',
//     paddingHorizontal: 10,
//     paddingBottom: 5,
//   },
//   reportButton: {
//     backgroundColor: '#E74C3C',
//     paddingVertical: 12,
//     borderRadius: 25,
//     alignItems: 'center',
//     margin: 15,
//     elevation: 5,
//   },
//   reportButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// ******* Main Code *******

// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
// import { useTranslation } from 'react-i18next';
// import RNPickerSelect from 'react-native-picker-select';
// import * as Location from 'expo-location';
// import axios from 'axios';
// import config from "../config.json"

// export default function Home({ navigation }) {
//   const { t, i18n } = useTranslation();
//   const [location, setLocation] = useState({ latitude: null, longitude: null });
//   const [data, setData] = useState([]);

//   const requestPermissions = async () => {
//     const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
//     if (locationStatus !== 'granted') {
//       Alert.alert(t("Permission Denied"), t("Location permission is required to proceed."));
//       return false;
//     }
//     return true;
//   };

//   const getCurrentLocation = async () => {
//     try {
//       const location = await Location.getCurrentPositionAsync({});
//       setLocation({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       });
//     } catch (error) {
//       console.error(t("Error getting location:"), error);
//     }
//   };

//   const fetchData = async () => {
//     try {
//       if (location.latitude && location.longitude) {
//         const response = await axios.get(`${config.API_BASE_URL}/api/issue/requests/nearby`, {
//           params: { latitude: location.latitude, longitude: location.longitude, radius: 5 },
//         });
//         setData(response.data.data);
//       }
//     } catch (error) {
//       console.error(t("Error fetching data:"), error);
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       const hasPermissions = await requestPermissions();
//       if (hasPermissions) {
//         await getCurrentLocation();
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     if (location.latitude && location.longitude) {
//       fetchData();
//     }
//   }, [location]);

//   return (
//     <View style={styles.container}>
//       <RNPickerSelect
//         onValueChange={(value) => i18n.changeLanguage(value)}
//         items={[
//           { label: 'English', value: 'en' },
//           { label: 'Gujarati', value: 'gn' },
//           { label: 'Hindi', value: 'hn' },
//         ]}
//       />

//       <ScrollView contentContainerStyle={styles.scrollView}>
//         {data.map((item, index) => (
//           <View key={index} style={styles.postContainer}>
//             <Text style={styles.postTitle}>{item.name}</Text>
//             <Text style={styles.postText}>{t('phone')}: {item.phoneNo}</Text>
//             <Text style={styles.postText}>{t('description')}: {item.description}</Text>
//             <Text style={styles.postText}>{t('status')}: {item.status}</Text>
//             <Text style={styles.postText}>{t('location')}: Lat {item.latitude}, Lon {item.longitude}</Text>
//             <Text style={styles.postText}>{t('needs')}: {item.needs.join(', ')}</Text>
//           </View>
//         ))}
//       </ScrollView>

//       <View style={styles.footer}>
//         <View style={styles.buttonContainer}>
//           <Button
//             title={t("report")}
//             onPress={() => { navigation.navigate('Reports'); }}
//           />
//         </View>
//       </View>
//     </View>
//   );
// }





// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   scrollView: {
//     padding: 10,
//   },
//   postContainer: {
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//     padding: 15,
//     marginVertical: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   postTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   postText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 3,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     backgroundColor: '#fff',
//   },
//   buttonContainer: {
//     flex: 1,
//     marginHorizontal: 5,
//   },
// });



// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
// import { useTranslation } from 'react-i18next';
// import RNPickerSelect from 'react-native-picker-select';
// import * as Location from 'expo-location';
// import axios from 'axios';
// import './i18n';

// export default function Home({ navigation }) {
//   const { t, i18n } = useTranslation(); // use the translation hook
//   const [location, setLocation] = useState({ latitude: null, longitude: null });
//   const [data, setData] = useState([]);

//   // Function to request permissions
//   const requestPermissions = async () => {
//     const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
//     if (locationStatus !== 'granted') {
//       Alert.alert(t("Permission Denied"), t("Location permission is required to proceed."));
//       return false;
//     }
//     return true;
//   };

//   const getCurrentLocation = async () => {
//     try {
//       const location = await Location.getCurrentPositionAsync({});
//       setLocation({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       });
//     } catch (error) {
//       console.error(t("Error getting location:"), error);
//     }
//   };

//   const fetchData = async () => {
//     try {
//       if (location.latitude && location.longitude) {
//         const response = await axios.get('http://192.168.15.50:3000/api/issue/requests/nearby', {
//           params: { latitude: location.latitude, longitude: location.longitude, radius: 5 },
//         });
//         setData(response.data.data);
//       }
//     } catch (error) {
//       console.error(t("Error fetching data:"), error);
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       const hasPermissions = await requestPermissions();
//       if (hasPermissions) {
//         await getCurrentLocation();
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     if (location.latitude && location.longitude) {
//       fetchData();
//     }
//   }, [location]);

//   // Language change handler
//   const handleLanguageChange = (lang) => {
//     i18n.changeLanguage(lang);
//   };

//   return (
//     <View style={styles.container}>
//       <RNPickerSelect
//         placeholder={{ label: t("Select Language"), value: null }}
//         items={[
//           { label: "English", value: "en" },
//           { label: "Spanish", value: "es" },
//           // Add other languages here
//         ]}
//         onValueChange={handleLanguageChange}
//         style={pickerSelectStyles}
//       />

//       <ScrollView contentContainerStyle={styles.scrollView}>
//         {data.map((item, index) => (
//           <View key={index} style={styles.postContainer}>
//             <Text style={styles.postTitle}>{item.name}</Text>
//             <Text style={styles.postText}>{t("phone")}: {item.phoneNo}</Text>
//             <Text style={styles.postText}>{t("description")}: {item.description}</Text>
//             <Text style={styles.postText}>{t("status")}: {item.status}</Text>
//             <Text style={styles.postText}>{t("location")}: Lat {item.latitude}, Lon {item.longitude}</Text>
//             <Text style={styles.postText}>{t("needs")}: {item.needs.join(', ')}</Text>
//           </View>
//         ))}
//       </ScrollView>

//       <View style={styles.footer}>
//         <View style={styles.buttonContainer}>
//           <Button
//             title={t("report")}
//             onPress={() => { navigation.navigate('Reports'); }}
//           />
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   scrollView: {
//     padding: 10,
//   },
//   postContainer: {
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//     padding: 15,
//     marginVertical: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   postTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   postText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 3,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     backgroundColor: '#fff',
//   },
//   buttonContainer: {
//     flex: 1,
//     marginHorizontal: 5,
//   },
// });

// const pickerSelectStyles = StyleSheet.create({
//   inputIOS: {
//     fontSize: 16,
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     borderWidth: 1,
//     borderColor: 'gray',
//     borderRadius: 4,
//     color: 'black',
//     paddingRight: 30,
//   },
//   inputAndroid: {
//     fontSize: 16,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     borderWidth: 0.5,
//     borderColor: 'gray',
//     borderRadius: 8,
//     color: 'black',
//     paddingRight: 30,
//   },
// });


// import React, { useEffect, useState } from 'react';
// import { View, TextInput, Button, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
// import * as Location from 'expo-location';
// // import * as ImagePicker from 'expo-image-picker';
// import { useTranslation } from 'react-i18next';
// import axios from 'axios';
// import RNPickerSelect from 'react-native-picker-select';


// export default function Home({ navigation }) {

//   const { t, i18n } = useTranslation();

//   const changeLanguage = (lng) => {
//     i18n.changeLanguage(lng)
//   }

//   const [location, setLocation] = useState({ latitude: null, longitude: null });
//   const [data, setData] = useState([]);

//   // Function to request permissions
//   const requestPermissions = async () => {
//     const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
//     if (locationStatus !== 'granted') {
//       Alert.alert("Permission Denied", "Location permission is required to proceed.");
//       return false;
//     }
//     return true;
//   };

//   // Function to get current location
//   const getCurrentLocation = async () => {
//     try {
//       const location = await Location.getCurrentPositionAsync({});
//       setLocation({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       });
//     } catch (error) {
//       console.error("Error getting location: ", error);
//     }
//   };

//   // Function to fetch nearby issues
//   const fetchData = async () => {
//     try {
//       if (location.latitude && location.longitude) {
//         const response = await axios.get('http://192.168.15.50:3000/api/issue/requests/nearby', {
//           params: { latitude: location.latitude, longitude: location.longitude, radius: 5 }
//         });
//         setData(response.data.data); // Access nested data array
//         console.log(data)
//       }
//     } catch (error) {
//       console.error("Error fetching data: ", error);
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       const hasPermissions = await requestPermissions();
//       if (hasPermissions) {
//         await getCurrentLocation();
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     if (location.latitude && location.longitude) {
//       fetchData();
//     }
//   }, [location]);
  

//   return (
//     <View style={styles.container}>

//       <RNPickerSelect
//         onValueChange={(value) => changeLanguage(value)}
//         items={[
//           { label: 'English', value: 'en' },
//           { label: 'Gujarati', value: 'gn' },
//           { label: 'Hindi', value: 'hn' },
//         ]}
//       />

//       <ScrollView contentContainerStyle={styles.scrollView}>
//         {data.map((item, index) => (
//           <View key={index} style={styles.postContainer}>
//             <Text style={styles.postTitle}>{item.name}</Text>
//             <Text style={styles.postText}>{t('phone')}: {item.phoneNo}</Text>
//             <Text style={styles.postText}>Description: {item.description}</Text>
//             <Text style={styles.postText}>Status: {item.status}</Text>
//             <Text style={styles.postText}>Location: Lat {item.latitude}, Lon {item.longitude}</Text>
//             <Text style={styles.postText}>Needs: {item.needs.join(', ')}</Text>
//           </View>
//         ))}
//       </ScrollView>
      
//       <View style={styles.footer}>
//       <View style={styles.buttonContainer}>
//           <Button
//             title="Report"
//             onPress={() => { navigation.navigate('Reports'); }}
//           />
//         </View>
//         {/* <View style={styles.buttonContainer}>
//           <Button
//             title="Issue"
//             onPress={() => { navigation.navigate('issue'); }}
//           />
//         </View> */}
//       </View>
//     </View>
//   );
// }