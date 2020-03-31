import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as ConfigCat from 'configcat-js';

export default function App() {

  const configcatClient = ConfigCat.createClientWithAutoPoll("7ZTVCKnUJprikI6Rwlj0RA/eJ8H21HZA06fDJrnzWyvGA", { pollIntervalSeconds: 2 });

  return (
    <View style={styles.container}>
      <Text>Is my awesome feature enabled?</Text>
        <Demo client={configcatClient}></Demo>
    </View>
  );
}

function Demo(props) {
  const [awesomeValue, setAwesomeValue] = useState(false);
  props.client.getValueAsync("isAwesomeFeatureEnabled", false).then(value => {
    setAwesomeValue(value);
  });
  return (
    <View style={styles.demo}>
      <Text style={styles.value}>{awesomeValue ? "yes" : "no"}</Text>
      <Button
        onPress={() => {
          props.client.getValueAsync("isAwesomeFeatureEnabled", false).then(value => {
            setAwesomeValue(value);
          });
        }}
        title={"Check feature flag"}
      />
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

  value: {
    margin:20
  },

  demo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
});