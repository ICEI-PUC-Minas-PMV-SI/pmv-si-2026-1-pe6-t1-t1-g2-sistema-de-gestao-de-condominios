import { StyleSheet, Text, View } from 'react-native';

export default function MaintenanceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Maintenance Screen - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9ff',
  },
  text: {
    fontSize: 16,
    color: '#111c2d',
  },
});
