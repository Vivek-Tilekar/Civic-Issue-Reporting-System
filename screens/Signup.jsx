import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

export default function Signup({ navigation }) {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        try {
          const response = await axios.post('http://192.168.15.50:3000/api/auth/signup', { 
            username, 
            email, 
            password 
          });
          Alert.alert('Success', response.data.message);
          navigation.navigate('Login');  // Navigate to the Login page after successful signup
        } catch (error) {
          Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
        }
      };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login 12</Text>
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
    // alignItems: "center",
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
