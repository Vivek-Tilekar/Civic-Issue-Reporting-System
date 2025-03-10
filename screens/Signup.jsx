import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import config from "../config.json"

export default function Signup({ navigation }) {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        try {
          const response = await axios.post(`${config.API_BASE_URL}/api/auth/signup`, { 
            username, 
            email, 
            password 
          });
          Alert.alert('Success', response.data.message);
          navigation.navigate('Login');  // Navigate to the Login page after successful signup
        } catch (error) {
          Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
          console.log(error.message);
        }
      };

  return (
    <View style={styles.container}>
      
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="UserName."
          placeholderTextColor="#003f5c"
          onChangeText={(uname) => setUsername(uname)}
        /> 
      </View> 
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
      <TouchableOpacity onPress={handleSignup} style={styles.loginBtn}>
        <Text style={styles.loginText}>SignUP</Text> 
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
    fontStyle: "bold"
  },
  forgot_button: {
    height: 30,
    marginBottom: 30,
  },
  loginBtn:
  {
    width:"70%",
    borderRadius:25,
    height:50,
    alignItems:"center",
    justifyContent:"center",
    marginTop:40,
    backgroundColor:"#4FC978",
  }
});
