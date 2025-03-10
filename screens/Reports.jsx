import React, { useEffect, useState } from 'react';
import { 
  View, TextInput, Button, Text, StyleSheet, ScrollView, 
  Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import RNPickerSelect from 'react-native-picker-select';
import config from "../config.json";
import AsyncStorage from '@react-native-async-storage/async-storage';

const cityAreaData = {
    "Vadodara": ["Gorwa", "Manjalpur", "Bajwa", "Sayajigunj"],
    "Ahemdabad": ["Chandkheda", "Ranip", "Maninagar"],
    "Gandhinagar": ["Gift City", "Akshardham", "Koba Circle"],
};

const issueCategories = ["Road Damage", "Street Light Outage", "Water Leakage", "Garbage Overflow", "Other"];

export default function CivicIssueReport({ navigation }) {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [userID, setUserID] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    })();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert("Error", "User is not authenticated.");
        return;
      }
      setUsername(storedUsername || '');
      setUserID(userId);
    };
    fetchUserDetails();
  }, []);

  const handleCameraLaunch = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!imageUri || !description || !selectedCity || !selectedArea || !selectedCategory || !address) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    
    const formData = new FormData();
    formData.append('photo', { uri: imageUri, name: 'issue.jpg', type: 'image/jpeg' });
    formData.append('userId', userID);
    formData.append('name', username);
    formData.append('city', selectedCity);
    formData.append('area', selectedArea);
    formData.append('latitude', location.latitude?.toString());
    formData.append('longitude', location.longitude?.toString());
    formData.append('category', selectedCategory);
    formData.append('description', description);
    formData.append('address', address);

    try {
      await axios.post(`${config.API_BASE_URL}/api/issue/requests`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert("Success", "Issue reported successfully!");
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert("Submission Failed", error.response?.data?.message || "There was an error submitting your report.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>

        <RNPickerSelect placeholder={{ label: 'Select Issue Category', value: null }} items={issueCategories.map(cat => ({ label: cat, value: cat }))} onValueChange={setSelectedCategory} style={pickerStyles} value={selectedCategory} />
        <TextInput style={styles.input} placeholder='Enter Address' onChangeText={setAddress} />
        <RNPickerSelect placeholder={{ label: 'Select City', value: null }} items={Object.keys(cityAreaData).map(city => ({ label: city, value: city }))} onValueChange={setSelectedCity} style={pickerStyles} value={selectedCity} />
        <RNPickerSelect placeholder={{ label: 'Select Area', value: null }} items={selectedCity ? cityAreaData[selectedCity].map(area => ({ label: area, value: area })) : []} onValueChange={setSelectedArea} style={pickerStyles} value={selectedArea} />
        <TextInput style={styles.input} placeholder='Enter Description' onChangeText={setDescription} multiline />
        <TouchableOpacity style={styles.cameraBtn} onPress={handleCameraLaunch}>
          <Text style={styles.cameraText}>Take Photo</Text>
        </TouchableOpacity>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
      </ScrollView>
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  scrollView: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: "#fff" },
  cameraBtn: { backgroundColor: "#007BFF", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  cameraText: { color: "#fff", fontSize: 16 },
  submitBtn: { backgroundColor: "#007BFF", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20, position: "absolute", bottom: 10, width: "90%", alignSelf: "center" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: '600' },
  imagePreview: { width: 100, height: 100, borderRadius: 8, alignSelf: 'center', marginTop: 15 },
});


// import React, { useEffect, useId, useState } from 'react';
// import { View, TextInput, Button, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
// import * as Location from 'expo-location';
// import * as ImagePicker from 'expo-image-picker';
// import axios from 'axios';
// import { useTranslation } from 'react-i18next';
// import RNPickerSelect from 'react-native-picker-select';
// import config from "../config.json";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const cityAreaData = {
//     "Vadodara": ["Gorwa", "Manjalpur", "Bajwa"],
//     "Ahemdabad": ["Chandkheda", "Ranip", "Maninagar"],
//     "Gandhinagar": ["Gift City", "Akshardham", "koba circle"],
// };

// const issueCategories = ["Road Damage", "Street Light Outage", "Water Leakage", "Garbage Overflow", "Other"];



// export default function CivicIssueReport({ navigation }) {
//   const [location, setLocation] = useState({ latitude: null, longitude: null });
//   const [imageUri, setImageUri] = useState(null);
//   const [description, setDescription] = useState('');
//   const [selectedCity, setSelectedCity] = useState('');
//   const [selectedArea, setSelectedArea] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [address, setAddress] = useState('');
//   const [username, setUsername] = useState('');
//   const [userID, setUserID] = useState('');
//   const { t } = useTranslation();

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status === 'granted') {
//         const location = await Location.getCurrentPositionAsync({});
//         setLocation({
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//         });
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     const fetchUsername = async () => {
//       const storedUsername = await AsyncStorage.getItem('username');
//       if (storedUsername) {
//         setUsername(storedUsername);
//       }
//       const userId = await AsyncStorage.getItem('userId'); // Retrieve userId
//       if (!userId) {
//         Alert.alert("Error", "User is not authenticated.");
//         return;
        
//       }
//       setUserID(userId);
      
//     };
//     fetchUsername();
//   }, []);

//   const handleCameraLaunch = async () => {
//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });
//     if (!result.canceled) {
//       setImageUri(result.assets[0].uri);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!imageUri || !description || !selectedCity || !selectedArea || !selectedCategory || !address) {
//       Alert.alert("Error", "All fields are required.");
//       return;
//     }
//     const formData = new FormData();
//     formData.append('photo', { uri: imageUri, name: 'issue.jpg', type: 'image/jpeg' });
//     formData.append('userId', userID);
//     formData.append('name', username);
//     formData.append('city', selectedCity);
//     formData.append('area', selectedArea);
//     formData.append('latitude', location.latitude?.toString());
//     formData.append('longitude', location.longitude?.toString());
//     formData.append('category', selectedCategory);
//     formData.append('description', description);
//     formData.append('address', address);

//     try {
//       await axios.post(`${config.API_BASE_URL}/api/issue/requests`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
//       Alert.alert("Success", "Issue reported successfully!");
//       navigation.navigate('Home');
//     } catch (error) {
//       Alert.alert("Submission Failed", error.response?.data?.message || "There was an error submitting your report.");
//       console.log(error.message)
//     }
//   };

//   return (
//     <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
//       <ScrollView>
        
//         <RNPickerSelect placeholder={{ label: 'Select Issue Category', value: null }} items={issueCategories.map(cat => ({ label: cat, value: cat }))} onValueChange={setSelectedCategory} style={pickerStyles} value={selectedCategory} />
//         <TextInput style={styles.textbox} placeholder='Enter Address' onChangeText={setAddress} />
//         <RNPickerSelect placeholder={{ label: 'Select City', value: null }} items={Object.keys(cityAreaData).map(city => ({ label: city, value: city }))} onValueChange={setSelectedCity} style={pickerStyles} value={selectedCity} />
//         <RNPickerSelect placeholder={{ label: 'Select Area', value: null }} items={selectedCity ? cityAreaData[selectedCity].map(area => ({ label: area, value: area })) : []} onValueChange={setSelectedArea} style={pickerStyles} value={selectedArea} />
        
        
//         <TextInput style={styles.textbox} placeholder='Enter Description' onChangeText={setDescription} multiline />
//         {/* <Text style={styles.locationText}>Location: Lat {location.latitude}, Lon {location.longitude}</Text> */}
//         <Button title='Take Photo' onPress={handleCameraLaunch} />
//         {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
//       </ScrollView>
//       <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
//         <Text style={styles.submitText}>Submit</Text>
//       </TouchableOpacity>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 15, backgroundColor: "#f9f9f9" },
//   title: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginVertical: 15 },
//   textbox: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginVertical: 8, backgroundColor: "#fff" },
//   locationText: { marginTop: 10, fontSize: 14, color: '#555' },
//   submitBtn: { backgroundColor: "#007BFF", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20, position: "absolute", bottom: 10, width: "90%", alignSelf: "center" },
//   submitText: { color: "#fff", fontSize: 16, fontWeight: '600' },
//   imagePreview: { width: 100, height: 100, borderRadius: 8, marginTop: 15, alignSelf: 'center' },
// });

const pickerStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, padding: 12, borderRadius: 8, backgroundColor: '#fff', marginVertical: 8 },
  inputAndroid: { fontSize: 16, padding: 12, borderRadius: 8, backgroundColor: '#fff', marginVertical: 8 },
});


// import React, { useEffect, useState } from 'react';
// import { View, TextInput, Button, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
// import * as Location from 'expo-location';
// import * as ImagePicker from 'expo-image-picker';
// import Checkbox from 'expo-checkbox';
// import axios from 'axios';
// import { useTranslation } from 'react-i18next';
// import RNPickerSelect from 'react-native-picker-select';
// import config from "../config.json"
// import AsyncStorage from '@react-native-async-storage/async-storage';
// const cityAreaData = {
//     "Vadodara": ["Gorwa", "Manjalpur", "Bajwa"],
//     "Ahemdabad": ["Chandkheda", "Ranip", "Maninagar"],
//     "Gandhinagar": ["Gift City", "Akshardham", "koba circle"],
// };

// const issueCategories = ["Road Damage", "Street Light Outage", "Water Leakage", "Garbage Overflow", "Other"];

// export default function CivicIssueReport({ navigation }) {
//   const [location, setLocation] = useState({ latitude: null, longitude: null });
//   const [imageUri, setImageUri] = useState(null);
//   const [description, setDescription] = useState('');
//   const [selectedCity, setSelectedCity] = useState('');
//   const [selectedArea, setSelectedArea] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [username, setUsername] = useState('');
//   const { t, i18n } = useTranslation();
  
//   const cities = Object.keys(cityAreaData).map(city => ({
//     label: city,
//     value: city,
//   }));

//   const areas = selectedCity ? cityAreaData[selectedCity].map(area => ({
//     label: area,
//     value: area,
//   })) : [];

//   const requestPermissions = async () => {
//     const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
//     const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    
//     if (locationStatus !== 'granted') {
//       Alert.alert(t('permissionDenied'), t('locationPermission'));
//       return false;
//     }
//     if (cameraStatus !== 'granted') {
//       Alert.alert(t('permissionDenied'), t('cameraPermission'));
//       return false;
//     }
//     return true;
//   };

//   const getCurrentLocation = async () => {
//     const location = await Location.getCurrentPositionAsync({});
//     setLocation({
//       latitude: location.coords.latitude,
//       longitude: location.coords.longitude,
//     });
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

//   const handleCameraLaunch = async () => {
//     if (imageUri) {
//       Alert.alert("Error", "You can only upload one image.");
//       return;
//     }
    
//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//       base64: true,
//     });

//     if (!result.canceled) {
//       setImageUri(result.assets[0].uri);
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

//   const createFormData = async (uri) => {
//     const formData = new FormData();
//     const response = await fetch(uri);
//     const blob = await response.blob();
//     const filename = uri.split('/').pop();
//     const match = /\.(\w+)$/.exec(filename);
//     const type = match ? `image/${match[1]}` : 'image';
    
//     formData.append('photo', {
//       uri: uri,
//       name: filename,
//       type: type,
//     });
//     formData.append('name', username);
//     formData.append('city', selectedCity);
//     formData.append('area', selectedArea);
//     formData.append('latitude', location.latitude?.toString());
//     formData.append('longitude', location.longitude?.toString());
//     formData.append('category', selectedCategory);
//     formData.append('description', description);

//     return formData;
//   };

//   const handleSubmit = async () => {
//     try {
//       if (!imageUri) {
//         Alert.alert("Error", "Please take a photo first");
//         return;
//       }

//       const formData = await createFormData(imageUri);
//       const response = await axios.post(
//         `${config.API_BASE_URL}/api/issue/requests`, 
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       );

//       Alert.alert("Success", "Issue reported successfully!");
//       navigation.navigate('Home');
//     } catch (error) {
//       console.error("Error submitting form: ", error);
//       Alert.alert(
//         "Submission Failed", 
//         error.response?.data?.message || "There was an error submitting your report."
//       );
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>{t('reportCivicIssue')}</Text>
//       <RNPickerSelect
//         placeholder={{ label: t('selectCityPlaceholder'), value: null }}
//         items={cities}
//         onValueChange={value => {
//           setSelectedCity(value);
//           setSelectedArea(null);
//         }}
//         style={pickerSelectStyles}
//         value={selectedCity}
//       />

//       <RNPickerSelect
//         placeholder={{ label: t('selectAreaPlaceholder'), value: null }}
//         items={areas}
//         onValueChange={value => setSelectedArea(value)}
//         style={pickerSelectStyles}
//         value={selectedArea}
//         disabled={!selectedCity}
//       />

//       <RNPickerSelect
//         placeholder={{ label: t('selectCategory'), value: null }}
//         items={issueCategories.map(cat => ({ label: cat, value: cat }))}
//         onValueChange={value => setSelectedCategory(value)}
//         style={pickerSelectStyles}
//         value={selectedCategory}
//       />

//       <TextInput
//         style={styles.textInput}
//         placeholder={t('description')}
//         placeholderTextColor="#003f5c"
//         onChangeText={setDescription}
//       />

//       <Text style={styles.locationText}>
//         Location: Lat {location.latitude}, Lon {location.longitude}
//       </Text>

//       <Button title={t('takePhoto')} onPress={handleCameraLaunch} />
//       {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

//       <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
//         <Text style={styles.submitText}>{t('submit')}</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#F5F7FA",
//     flex: 1,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#2C3E50",
//     textAlign: "center",
//     marginBottom: 20,
//     textTransform: "uppercase",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#34495E",
//     marginBottom: 8,
//     textTransform: "uppercase",
//   },
//   inputView: {
//     backgroundColor: "#ECF0F1",
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#BDC3C7",
//     paddingHorizontal: 12,
//     height: 50,
//     justifyContent: "center",
//     marginBottom: 15,
//   },
//   textInput: {
//     fontSize: 16,
//     color: "#2C3E50",
//   },
//   locationText: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#2C3E50",
//     marginBottom: 15,
//   },
//   imagePreview: {
//     width: 120,
//     height: 120,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#BDC3C7",
//     marginTop: 10,
//     alignSelf: "center",
//   },
//   submitBtn: {
//     backgroundColor: "#2980B9",
//     borderRadius: 5,
//     height: 50,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   submitText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//     textTransform: "uppercase",
//   },
// });

// const pickerSelectStyles = StyleSheet.create({
//   inputIOS: {
//     fontSize: 16,
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     borderWidth: 1,
//     borderColor: "#BDC3C7",
//     borderRadius: 5,
//     color: "#2C3E50",
//     backgroundColor: "#ECF0F1",
//     marginBottom: 15,
//   },
//   inputAndroid: {
//     fontSize: 16,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderWidth: 1,
//     borderColor: "#BDC3C7",
//     borderRadius: 5,
//     color: "#2C3E50",
//     backgroundColor: "#ECF0F1",
//     marginBottom: 15,
//   },
// });



// ****************** MAIN *******************

// import React, { useEffect, useState } from 'react';
// import { View, TextInput, Button, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
// import * as Location from 'expo-location';
// import * as ImagePicker from 'expo-image-picker';
// import Checkbox from 'expo-checkbox';
// import axios from 'axios';
// import { useTranslation } from 'react-i18next';
// import RNPickerSelect from 'react-native-picker-select';
// import config from "../config.json"
// const cityAreaData = {
//     "Vadodara": ["Gorwa", "Manjalpur", "Bajwa"],
//     "Ahemdabad": ["Chandkheda", "Ranip", "Maninagar"],
//     "Gandhinagar": ["Gift City", "Akshardham", "koba circle"],
// };

// const needsOptions = ["Food", "Shelter", "Medical Aid", "Water", "Other"]; // Add more options as needed

// export default function Reports({ navigation }) {
//   const [location, setLocation] = useState({ latitude: null, longitude: null });
//   const [imageUri, setImageUri] = useState(null);
//   const [name, setName] = useState('');
//   const [phoneNo, setPhoneNo] = useState('');
//   const [description, setDescription] = useState('');
//   const [noofpeople, setNoofPeople] = useState('');
//   const [selectedCity, setSelectedCity] = useState('');
//   const [selectedArea, setSelectedArea] = useState('');
//   const [selectedNeeds, setSelectedNeeds] = useState([]); // Holds the selected needs
//   const [username, setUsername] = useState('');
//   const { t, i18n } = useTranslation();
  

//   // Create an array of cities for the first dropdown
//   const cities = Object.keys(cityAreaData).map(city => ({
//     label: city,
//     value: city,
//   }));

//   // Create an array of areas based on the selected city
//   const areas = selectedCity ? cityAreaData[selectedCity].map(area => ({
//     label: area,
//     value: area,
//   })) : [];

//   const requestPermissions = async () => {
//     const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
//     const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    
//     if (locationStatus !== 'granted') {
//       Alert.alert(t('permissionDenied'), t('locationPermission'));
//       return false;
//     }
//     if (cameraStatus !== 'granted') {
//       Alert.alert(t('permissionDenied'), t('cameraPermission'));
//       return false;
//     }
//     return true;
//   };

//   const getCurrentLocation = async () => {
//     const location = await Location.getCurrentPositionAsync({});
//     setLocation({
//       latitude: location.coords.latitude,
//       longitude: location.coords.longitude,
//     });
//   };

//   const handleCameraLaunch = async () => {
//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//       base64: true, // Add this to get base64 data
//     });

//     if (!result.canceled) {
//       setImageUri(result.assets[0].uri);
//     }
//   };

//   const handleNeedChange = (need) => {
//     setSelectedNeeds((prevNeeds) =>
//       prevNeeds.includes(need)
//         ? prevNeeds.filter((item) => item !== need) // Remove if already selected
//         : [...prevNeeds, need] // Add if not selected
//     );
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

//   const createFormData = async (uri) => {
//     const formData = new FormData();
    
//     // Convert uri to blob
//     const response = await fetch(uri);
//     const blob = await response.blob();
    
//     // Generate a unique filename
//     const filename = uri.split('/').pop();
//     const match = /\.(\w+)$/.exec(filename);
//     const type = match ? `image/${match[1]}` : 'image'
    
//     // Append the image
//     formData.append('photo', {
//       uri: uri,
//       name: filename,
//       type: type,
//     });

//     // Append other form data
//     formData.append('name', username);
//     formData.append('phoneNo', phoneNo);
//     formData.append('city', selectedCity);
//     formData.append('area', selectedArea);
//     formData.append('latitude', location.latitude?.toString());
//     formData.append('longitude', location.longitude?.toString());
//     formData.append('needs', JSON.stringify(selectedNeeds));
//     formData.append('description', description);
//     formData.append('numberOfPeople', noofpeople);

//     return formData;
//   };

//   const handleSubmit = async () => {
//     try {
//       if (!imageUri) {
//         Alert.alert("Error", "Please take a photo first");
//         return;
//       }

//       const formData = await createFormData(imageUri);

//       const response = await axios.post(
//         // 'http://192.168.165.143:3000/api/issue/requests'
//         `${config.API_BASE_URL}/api/issue/requests`, 
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//           transformRequest: (data, headers) => {
//             return formData; // Prevent axios from trying to transform FormData
//           },
//         }
//       );

//       Alert.alert("Success", "Form submitted successfully!");
//       navigation.navigate('Home');
//     } catch (error) {
//       console.error("Error submitting form: ", error);
//       Alert.alert(
//         "Submission Failed", 
//         error.response?.data?.message || "There was an error submitting your request."
//       );
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

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//         <RNPickerSelect
//         onValueChange={(value) => i18n.changeLanguage(value)}
//         items={[
//           { label: 'English', value: 'en' },
//           { label: 'Hindi', value: 'hn' },
//         ]}
//       />
      
//       <View style={styles.inputView}>
//         <TextInput
//           style={styles.TextInput}
//           placeholder={t('phoneNo')}
//           placeholderTextColor="#003f5c"
//           onChangeText={setPhoneNo}
//           keyboardType="phone-pad"
//         />
//       </View>

//       <Text style={styles.title}>{t('selectCityAndArea')}</Text>

//       <RNPickerSelect
//         placeholder={{ label: t('selectCityPlaceholder'), value: null }}
//         items={cities}
//         onValueChange={value => {
//           setSelectedCity(value);
//           setSelectedArea(null);
//         }}
//         style={pickerSelectStyles}
//         value={selectedCity}
//       />

//       <RNPickerSelect
//         placeholder={{ label: t('selectAreaPlaceholder'), value: null }}
//         items={areas}
//         onValueChange={value => setSelectedArea(value)}
//         style={pickerSelectStyles}
//         value={selectedArea}
//         disabled={!selectedCity}
//       />

//       <Text style={styles.title}>{t('needsTitle')}</Text>
//       {needsOptions.map((need, index) => (
//         <View key={index} style={styles.checkboxContainer}>
//           <Checkbox
//             value={selectedNeeds.includes(need)}
//             onValueChange={() => handleNeedChange(need)}
//           />
//           <Text style={styles.checkboxLabel}>{need}</Text>
//         </View>
//       ))}

//       <View style={styles.inputView}>
//         <TextInput
//           style={styles.TextInput}
//           placeholder={t('description')}
//           placeholderTextColor="#003f5c"
//           onChangeText={setDescription}
//         />
//       </View>
//       <View style={styles.inputView}>
//         <TextInput
//           style={styles.TextInput}
//           placeholder={t('noOfPeople')}
//           placeholderTextColor="#003f5c"
//           onChangeText={setNoofPeople}
//           keyboardType="numeric"
//         />
//       </View>
//       <Text style={styles.locationText}>
//         Location: Lat {location.latitude}, Lon {location.longitude}
//       </Text>

//       <Button title={t('takePhoto')} onPress={handleCameraLaunch} />

//       {imageUri && (
//         <Image source={{ uri: imageUri }} style={{ width: 100, height: 100, marginTop: 10 }} />
//       )}

//       <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
//         <Text style={styles.submitText}>{t('submit')}</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }



// const styles = StyleSheet.create({
//     container: {
//       padding: 15,
//       backgroundColor: "#f4f6f9",
//     },
//     heading: {
//       fontSize: 22,
//       fontWeight: '600',
//       color: '#333',
//       textAlign: 'center',
//       marginVertical: 15,
//     },
//     inputView: {
//       backgroundColor: "#e0e5ec",
//       borderRadius: 10,
//       paddingHorizontal: 10,
//       height: 50,
//       marginVertical: 8,
//     },
//     TextInput: {
//       height: 50,
//       fontSize: 16,
//       color: "#333",
//     },
//     sectionTitle: {
//       fontSize: 18,
//       fontWeight: '500',
//       color: '#333',
//       marginVertical: 12,
//     },
//     checkboxContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: 10,
//     },
//     checkboxLabel: {
//       fontSize: 16,
//       color: '#555',
//       marginLeft: 8,
//     },
//     locationText: {
//       marginTop: 10,
//       fontSize: 14,
//       color: '#333',
//     },
//     submitBtn: {
//       borderRadius: 10,
//       height: 50,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: "#4FC978",
//       marginTop: 20,
//       marginBottom: 30,
//     },
//     submitText: {
//       color: "#fff",
//       fontSize: 16,
//       fontWeight: '600',
//     },
//     imagePreview: {
//       width: 100,
//       height: 100,
//       borderRadius: 8,
//       marginTop: 15,
//       alignSelf: 'center',
//     },
//   });
  
//   const pickerSelectStyles = StyleSheet.create({
//     inputIOS: {
//       fontSize: 16,
//       paddingVertical: 10,
//       paddingHorizontal: 12,
//       borderRadius: 10,
//       color: 'black',
//       backgroundColor: '#e0e5ec',
//       marginVertical: 8,
//     },
//     inputAndroid: {
//       fontSize: 16,
//       paddingVertical: 8,
//       paddingHorizontal: 12,
//       borderRadius: 10,
//       color: 'black',
//       backgroundColor: '#e0e5ec',
//       marginVertical: 8,
//     },
//   });