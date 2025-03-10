import { useState, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import CheckBox from "expo-checkbox";
import axios from 'axios';
import config from "../config.json"
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVolunteer, setIsVolunteer] = useState(false);

  useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false,
        headerTitle: '',
        headerLeft: () => null,
      });
    }, [navigation]);

  const handleLogin = async () => {
    try {
      // Determine API endpoint based on user type
      const endpoint = isVolunteer
        ? `${config.API_BASE_URL}/api/volunteers/volunteer-signin`
        : `${config.API_BASE_URL}/api/auth/signin`;
        // ? 'http://192.168.165.143:3000/api/volunteers/volunteer-signin'
        // : 'http://192.168.165.143:3000/api/auth/signin';

      const response = await axios.post(endpoint, { 
        email, 
        password 
      });

      // Check status code and respond accordingly
      if (response.status === 200) {
        const { token, username, userId } = response.data; 
        console.log(userId);
        console.log(username);
        // Store token and username in AsyncStorage
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('userId', userId.toString());
        const screen = isVolunteer ? 'issue' : 'Home';
        navigation.navigate(screen);
      } else {
        // Different responses based on volunteer/user login status
        Alert.alert(
          'Login Failed', 
          isVolunteer 
            ? 'Volunteer login failed. Please check your credentials.' 
            : 'User login failed. Please check your credentials.'
        );
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Alert.alert('Unauthorized', 'Invalid email or password.');
      } else if (error.response && error.response.status === 404) {
        Alert.alert('Not Found', isVolunteer ? 'Volunteer not found.' : 'User not found.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  };

  //     // Navigate based on user type
  //     const screen = isVolunteer ? 'issue' : 'Home';
  //     navigation.navigate(screen);  
  //   } catch (error) {
  //     Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
  //   }
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Email."
          placeholderTextColor="#003f5c"
          onChangeText={(email) => setEmail(email)}
        /> 
      </View> 
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Password."
          placeholderTextColor="#003f5c"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        /> 
      </View>

      <View style={styles.checkboxContainer}>
        

        <CheckBox
          value={isVolunteer}
          onValueChange={setIsVolunteer}
          style={styles.checkbox}
        />
        <Text style={styles.label}>Are you a volunteer?</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.forgot_button}>don't have account?</Text> 
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogin} style={styles.loginBtn}>
        <Text style={styles.loginText}>LOGIN</Text> 
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputView: {
    backgroundColor: "silver",
    borderRadius: 30,
    width: "80%",
    height: 45,
    marginBottom: 20,
  },
  TextInput: {
    height: 50,
    flex: 1,
    padding: 10,
    marginLeft: 20,
  }, 
  heading : {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 20,
  },
  forgot_button: {
    height: 30,
    marginBottom: 30,
  },
  loginBtn: {
    width:"70%",
    borderRadius:25,
    height:50,
    alignItems:"center",
    justifyContent:"center",
    marginTop:40,
    backgroundColor:"#4FC978",
  },
  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
  },
});
















