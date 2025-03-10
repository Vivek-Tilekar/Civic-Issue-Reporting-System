import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Home from './screens/Home';
import Reports from './screens/Reports';
import Issue from './screens/issue';
import './screens/i18n'
import Notification from './screens/Notification';
import MyReport from './screens/MyReport';
// import '@formatjs/intl-pluralrules/polyfill';
// import CreateEmergencyRequest from './screens/CreateEmergencyRequest';

const Stack = createStackNavigator();

export default function App() {

  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Reports" component={Reports} />
        <Stack.Screen name="issue" component={Issue} />
        <Stack.Screen name="Notifications" component={Notification} />
        <Stack.Screen name="myReport" component={MyReport} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


