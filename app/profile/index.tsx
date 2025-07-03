import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ProfileSkeleton from '../../components/ProfileSkeleton';
import SessionInfo from '../../components/SessionInfo';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useLanguage } from '../../lib/contexts/LanguageContext';

type MapOption = 'google' | 'apple';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user, isAuthenticated, sessionValid } = useAuth();
  const { profile, loading } = useProfile();
  const { t, language } = useLanguage();
  
  const [showMapModal, setShowMapModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMap, setSelectedMap] = useState<MapOption>('google');
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleSignOut = async () => {
    Alert.alert(
      t('profile.signout'),
      t('profile.signout.confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    console.log('🔄 Navigation vers édition du profil');
    router.push('/profile/edit');
  };

  const handleLanguageSelect = () => {
    console.log('🔄 Navigation vers sélection de langue');
    router.push('/profile/language');
  };

  const getLanguageDisplayName = () => {
    switch (language) {
      case 'fr':
        return 'Français';
      case 'en':
        return 'English';
      case 'ar':
        return 'العربية';
      default:
        return 'Français';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ProfileSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('profile.title')}</Text>

      {/* Session Info */}
      <SessionInfo showDetails={true} />

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ 
              uri: profile?.profile_image || user?.profile_image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80'
            }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.name || user?.name || 'Nom non défini'}
            </Text>
            <Text style={styles.profileEmail}>
              {profile?.email || user?.email || 'Email non défini'}
            </Text>
            {(profile?.phone_number || user?.phone_number) && (
              <Text style={styles.profilePhone}>
                {profile?.phone_number || user?.phone_number}
              </Text>
            )}
            {profile?.bio && (
              <Text style={styles.profileBio} numberOfLines={2}>
                {profile.bio}
              </Text>
            )}
            <Text style={styles.profileRole}>
              {user?.role === 'customer' ? 'Client' : 'Partenaire'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={handleEditProfile}
        >
          <Ionicons name="create-outline" size={20} color="#E41E31" />
          <Text style={styles.editProfileText}>{t('profile.edit')}</Text>
        </TouchableOpacity>
      </View>

      {/* Settings List */}
      <View style={styles.settingsList}>
        {/* Language */}
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleLanguageSelect}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="language" size={24} color="black" />
            <Text style={styles.settingText}>{t('profile.language')}</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{getLanguageDisplayName()}</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Chat with us */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="chatbubble-outline" size={24} color="black" />
            <Text style={styles.settingText}>{t('profile.chat')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Payment Methods */}
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setShowPaymentModal(true)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="card-outline" size={24} color="black" />
            <Text style={styles.settingText}>{t('profile.payment')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Addresses */}
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => {
            console.log('🔄 Navigation vers gestion des adresses');
            router.push('/profile/addresses');
          }}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="location-outline" size={24} color="black" />
            <Text style={styles.settingText}>Mes adresses</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Favorites */}
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => {
            console.log('🔄 Navigation vers mes favoris');
            router.push('/favorites');
          }}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="heart-outline" size={24} color="black" />
            <Text style={styles.settingText}>Mes favoris</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Default map application */}
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setShowMapModal(true)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="map-outline" size={24} color="black" />
            <Text style={styles.settingText}>{t('profile.map')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Subscription settings */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="mail-outline" size={24} color="black" />
            <Text style={styles.settingText}>{t('profile.subscription')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Advanced Settings */}
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => {
            console.log('🔄 Navigation vers paramètres avancés');
            router.push('/profile/settings');
          }}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="settings-outline" size={24} color="black" />
            <Text style={styles.settingText}>Paramètres avancés</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Terms & Services */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="document-text-outline" size={24} color="black" />
            <Text style={styles.settingText}>{t('profile.terms')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="lock-closed-outline" size={24} color="black" />
            <Text style={styles.settingText}>{t('profile.privacy')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity 
          style={[styles.settingItem, styles.signOutItem]}
          onPress={handleSignOut}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="log-out-outline" size={24} color="#E41E31" />
            <Text style={[styles.settingText, styles.signOutText]}>{t('profile.signout')}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Map Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMapModal}
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>{t('map.title')}</Text>
            <Text style={styles.modalSubtitle}>{t('map.subtitle')}</Text>

            {/* Map Options */}
            <View style={styles.optionsContainer}>
              {/* Google Maps Option */}
              <TouchableOpacity 
                style={styles.optionRow}
                onPress={() => setSelectedMap('google')}
              >
                <View style={styles.optionLeft}>
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1592910147752-5e6cc17c269f?w=64&h=64&fit=crop' }}
                    style={styles.mapIcon}
                  />
                  <Text style={styles.optionText}>{t('map.google')}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedMap === 'google' && styles.radioButtonSelected
                ]} />
              </TouchableOpacity>

              {/* Apple Maps Option */}
              <TouchableOpacity 
                style={styles.optionRow}
                onPress={() => setSelectedMap('apple')}
              >
                <View style={styles.optionLeft}>
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1633488973949-88ef4aa4e876?w=64&h=64&fit=crop' }}
                    style={styles.mapIcon}
                  />
                  <Text style={styles.optionText}>{t('map.apple')}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedMap === 'apple' && styles.radioButtonSelected
                ]} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setShowMapModal(false)}
            >
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPaymentModal}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>{t('payment.title')}</Text>

            {/* Card Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('payment.cardNumber')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>{t('payment.expiry')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/AA"
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>{t('payment.cvv')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('payment.holder')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="JOHN DOE"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.saveButtonText}>{t('payment.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  profileSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  profileRole: {
    fontSize: 14,
    color: '#666',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E41E31',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  editProfileText: {
    color: '#E41E31',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  settingsList: {
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingText: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  signOutItem: {
    marginTop: 16,
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#E41E31',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 18,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  radioButtonSelected: {
    borderColor: '#E41E31',
    backgroundColor: '#E41E31',
  },
  saveButton: {
    backgroundColor: '#E41E31',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
}); 