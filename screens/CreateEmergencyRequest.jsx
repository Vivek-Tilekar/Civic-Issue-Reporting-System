import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phoneNo: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  needs: Yup.string().required('Needs are required'),
  description: Yup.string().required('Description is required'),
  numberOfPeople: Yup.number()
    .required('Number of people is required')
    .positive('Must be a positive number')
    .integer('Must be a whole number'),
});

const CreateEmergencyRequest = () => {
  const [location, setLocation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestPermissions();
    getCurrentLocation();
  }, []);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const locationPermission = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        );
        const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);

        if (
          locationPermission !== RESULTS.GRANTED ||
          cameraPermission !== RESULTS.GRANTED
        ) {
          Alert.alert(
            'Permission Required',
            'Please grant location and camera permissions to use this app'
          );
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to get your location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleImageCapture = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });

      if (!result.didCancel && !result.errorCode) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = {
        ...values,
        location: location,
        image: selectedImage,
      };

      // Add your API call here to submit the form data
      console.log('Form Data:', formData);

      Alert.alert('Success', 'Form submitted successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Failed to submit form');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Formik
        initialValues={{
          name: '',
          phoneNo: '',
          needs: '',
          description: '',
          numberOfPeople: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.formContainer}>
            <Text style={styles.title}>User Information Form</Text>

            {/* Location Display */}
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>Current Location:</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : location ? (
                <Text>
                  Lat: {location.latitude.toFixed(6)}, Long:{' '}
                  {location.longitude.toFixed(6)}
                </Text>
              ) : (
                <Text>Getting location...</Text>
              )}
            </View>

            {/* Form Fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
                placeholder="Enter your name"
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('phoneNo')}
                onBlur={handleBlur('phoneNo')}
                value={values.phoneNo}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
              />
              {touched.phoneNo && errors.phoneNo && (
                <Text style={styles.errorText}>{errors.phoneNo}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Needs</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('needs')}
                onBlur={handleBlur('needs')}
                value={values.needs}
                placeholder="Enter your needs"
              />
              {touched.needs && errors.needs && (
                <Text style={styles.errorText}>{errors.needs}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                value={values.description}
                multiline
                numberOfLines={4}
                placeholder="Enter description"
              />
              {touched.description && errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Number of People</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('numberOfPeople')}
                onBlur={handleBlur('numberOfPeople')}
                value={values.numberOfPeople}
                keyboardType="numeric"
                placeholder="Enter number of people"
              />
              {touched.numberOfPeople && errors.numberOfPeople && (
                <Text style={styles.errorText}>{errors.numberOfPeople}</Text>
              )}
            </View>

            {/* Image Capture */}
            <View style={styles.imageContainer}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleImageCapture}
              >
                <Text style={styles.captureButtonText}>Capture Image</Text>
              </TouchableOpacity>
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.previewImage}
                />
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  locationContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  locationText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: 200,
    height: 200,
    marginTop: 15,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateEmergencyRequest;