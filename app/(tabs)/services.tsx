import { MaterialIcons } from '@expo/vector-icons';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const PADDING = 16;
const CARD_WIDTH = (width - (PADDING * 2) - 16) / 3;

const MAIN_SERVICES = [
  {
    id: 'restaurants',
    title: 'Restaurants',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&q=80&fit=crop',
  },
  {
    id: 'snoomart',
    title: 'Market',
    image: 'https://images.unsplash.com/photo-1543168256-418811576931?w=300&h=300&q=80&fit=crop',
    badge: '24/7',
  },
  {
    id: 'grocery',
    title: 'Supermarket',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&q=80&fit=crop',
  },
  {
    id: 'gifting',
    title: 'Gifting',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&h=300&q=80&fit=crop',
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&q=80&fit=crop',
  },
  {
    id: 'health',
    title: 'Health & Beauty',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=300&q=80&fit=crop',
  },
  {
    id: 'electronics',
    title: 'Electronics',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&h=300&q=80&fit=crop',
  },
  {
    id: 'baby',
    title: 'Baby & Kids',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&q=80&fit=crop',
  },
  {
    id: 'household',
    title: 'Household & Garden',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&h=300&q=80&fit=crop',
  },
  {
    id: 'books',
    title: 'Books & Stationery',
    image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=300&h=300&q=80&fit=crop',
  },
  {
    id: 'sports',
    title: 'Sports & Outdoors',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=300&h=300&q=80&fit=crop',
  },
  {
    id: 'health_beauty',
    title: 'Health & Beauty',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&q=80&fit=crop',
  },
  {
    id: 'clothes',
    title: 'Clothes & Accessories',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=300&q=80&fit=crop',
  }
];




export default function ServicesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Services</Text>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.location}>Conakry</Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Main Services Grid */}
        <View style={styles.grid}>
          {MAIN_SERVICES.map((service) => (
            <TouchableOpacity key={service.id} style={styles.mainCard}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: service.image }}
                  style={styles.image}
                  resizeMode="cover"
                />
                {service.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{service.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>


       
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: PADDING,
    paddingVertical: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: PADDING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  mainCard: {
    width: CARD_WIDTH,
    marginBottom: 20,
    marginHorizontal: 4,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#00C853',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newBadge: {
    backgroundColor: '#E31837',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  seeAll: {
    marginLeft: 'auto',
    color: '#666',
    fontSize: 14,
  },
  horizontalScroll: {
    paddingRight: PADDING,
  },
  serviceCard: {
    width: width * 0.4,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    aspectRatio: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  serviceSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
}); 