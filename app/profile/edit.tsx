import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActionSheetIOS, ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../../hooks/useProfile';

export default function EditProfile() {
  const router = useRouter();
  const { profile, updateProfile, updateAvatar, loading, error } = useProfile();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);

  // Charger les données du profil
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone_number || '');
      setEmail(profile.email || '');
      setBio(profile.bio || '');
      setAddress(profile.address || '');
      setCountry(profile.country || '');
      setImage(profile.profile_image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80');
    }
  }, [profile]);

  const handleBack = () => {
    router.back();
  };

  const handleImagePick = async () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', 'Appareil photo', 'Galerie'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            // Appareil photo
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status === 'granted') {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0].uri) {
                setImage(result.assets[0].uri);
                // Ici vous pourriez uploader l'image vers Supabase Storage
                // Pour l'instant, on utilise juste l'URI locale
              }
            } else {
              Alert.alert('Permission refusée', 'Veuillez autoriser l\'accès à l\'appareil photo dans les paramètres.');
            }
          } else if (buttonIndex === 2) {
            // Galerie
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status === 'granted') {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0].uri) {
                setImage(result.assets[0].uri);
                // Ici vous pourriez uploader l'image vers Supabase Storage
                // Pour l'instant, on utilise juste l'URI locale
              }
            } else {
              Alert.alert('Permission refusée', 'Veuillez autoriser l\'accès à la galerie dans les paramètres.');
            }
          }
        }
      );
    } else {
      // Pour Android, on utilise directement la galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets[0].uri) {
          setImage(result.assets[0].uri);
        }
      } else {
        Alert.alert('Permission refusée', 'Veuillez autoriser l\'accès à la galerie dans les paramètres.');
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }

    setSaving(true);
    try {
      const updates: any = {
        name: name.trim(),
        phone_number: phone.trim() || null,
        bio: bio.trim() || null,
        address: address.trim() || null,
        country: country.trim() || null,
      };

      // Si l'image a changé et n'est pas une URL externe, on pourrait l'uploader ici
      if (image !== profile?.profile_image && !image.startsWith('http')) {
        // Ici vous pourriez uploader l'image vers Supabase Storage
        // Pour l'instant, on garde l'image locale
        updates.profile_image = image;
      }

      const result = await updateProfile(updates);
      
      if (result.success) {
        // Retourner directement à la page précédente sans alerte
        router.back();
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => {
          // Ici vous pourriez implémenter la suppression du compte
          Alert.alert('Fonctionnalité à venir', 'La suppression de compte sera bientôt disponible.');
        }},
      ]
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Modifier le profil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: image }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton} onPress={handleImagePick}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

        <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom complet *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Entrez votre nom complet"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
            <Text style={styles.label}>Numéro de téléphone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Entrez votre numéro de téléphone"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
            <Text style={styles.label}>Adresse email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            editable={false}
            placeholder="Votre adresse e-mail"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.disabledText}>
              L'email ne peut pas être modifié
          </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Parlez-nous un peu de vous..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations importantes</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Adresse complète</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Entrez votre adresse complète"
              placeholderTextColor="#999"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pays</Text>
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              placeholder="Votre pays"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Les informations marquées d'un astérisque (*) sont obligatoires.
        </Text>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <View style={styles.saveButtonLoading}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.saveButtonLoadingText}>Enregistrement...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Supprimer le compte</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    backgroundColor: '#E41E31',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 16,
  },
  disabledInput: {
    backgroundColor: '#f1f3f4',
    color: '#666',
  },
  disabledText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  disclaimer: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#E41E31',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#E41E31',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonLoadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteButton: {
    marginTop: 'auto',
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '500',
  },
}); 