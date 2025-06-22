import { MaterialIcons } from '@expo/vector-icons';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BANNERS = [
  {
    id: 1,
    title: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80'
  },
  {
    id: 2,
    title: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80'
  },
  {
    id: 3,
    title: 'Pharmacy',
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80'
  },
  {
    id: 4,
    title: 'Makeup',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
  },
];

const SERVICES = [
  { 
    id: 1, 
    title: 'Restaurants', 
    icon: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&q=80',
  },
  { 
    id: 2, 
    title: 'Supermarket', 
    icon: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80',
    badge: '24/7' 
  },
  { 
    id: 3, 
    title: 'Market', 
    icon: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80',
  },
  { 
    id: 4, 
    title: 'Electronics', 
    icon: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80',
    badge: 'New' 
  },
  { 
    id: 5, 
    title: 'Gifting', 
    icon: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&q=80',
  },
  { 
    id: 6, 
    title: 'Drugs', 
    icon: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&q=80',
  },
  { 
    id: 7, 
    title: 'Makeup\nKit', 
    icon: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80',
  },
  { 
    id: 8, 
    title: 'More', 
    icon: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=200&q=80',
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Address Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.addressLabel}>Address</Text>
          <TouchableOpacity style={styles.addressButton}>
            <Text style={styles.addressText}>Conakry, Conakry, Guinea</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for stores or products"
          placeholderTextColor="#666"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Scrollable Banners */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.bannerScroll}
        >
          {BANNERS.map((banner) => (
            <View key={banner.id} style={styles.bannerContainer}>
              <Image
                source={{ uri: banner.image }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerText}>{banner.title}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Services Grid */}
        <View style={styles.servicesGrid}>
          {SERVICES.map((service) => (
            <TouchableOpacity key={service.id} style={styles.serviceItem}>
              <View style={styles.serviceIconContainer}>
                <Image 
                  source={{ uri: service.icon }} 
                  style={styles.serviceIcon} 
                  resizeMode="cover"
                />
                {service.badge && (
                  <View style={[
                    styles.badge,
                    { backgroundColor: service.badge === 'New' ? '#E31837' : '#00C853' }
                  ]}>
                    <Text style={styles.badgeText}>{service.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.servicesScroll}
            contentContainerStyle={styles.servicesScrollContent}
          >
            {SERVICES.slice(0, 4).map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <Image
                  source={{ uri: service.icon }}
                  style={styles.serviceCardImage}
                  resizeMode="cover"
                />
                <View style={styles.serviceCardOverlay}>
                  <Text style={styles.serviceCardTitle}>{service.title}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  content: {
    flex: 1,
  },
  bannerScroll: {
    height: 180,
  },
  bannerContainer: {
    width: width - 32,
    height: 180,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginVertical: 24,
  },
  serviceItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  serviceIconContainer: {
    position: 'relative',
    marginBottom: 8,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  serviceIcon: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serviceTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000',
  },
  servicesSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  newBadge: {
    backgroundColor: '#E31837',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seeAllButton: {
    marginLeft: 'auto',
  },
  seeAllText: {
    color: '#666',
    fontSize: 16,
  },
  servicesScroll: {
    marginBottom: 24,
  },
  servicesScrollContent: {
    paddingRight: 16,
  },
  serviceCard: {
    width: 200,
    height: 120,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  serviceCardImage: {
    width: '100%',
    height: '100%',
  },
  serviceCardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  serviceCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
