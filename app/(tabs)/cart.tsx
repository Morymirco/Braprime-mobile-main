import { StyleSheet, View } from 'react-native';
import Cart from '../cart';

export default function CartScreen() {
  return (
    <View style={styles.container}>
      <Cart />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 