import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalSearch from '../components/GlobalSearch';

export default function SearchScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GlobalSearch />
    </SafeAreaView>
  );
} 