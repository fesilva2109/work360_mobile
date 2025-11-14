import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../src/styles/theme';

export default function AnalyticsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Produtividade</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
