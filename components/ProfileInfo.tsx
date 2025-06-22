import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useProfile } from '../hooks/useProfile';

interface ProfileInfoProps {
  showAvatar?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export default function ProfileInfo({ 
  showAvatar = true, 
  showEmail = true, 
  showPhone = true,
  size = 'medium',
  style 
}: ProfileInfoProps) {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>Profil non disponible</Text>
      </View>
    );
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          avatarSize: 32,
          nameSize: 14,
          infoSize: 12,
        };
      case 'large':
        return {
          avatarSize: 80,
          nameSize: 20,
          infoSize: 16,
        };
      default: // medium
        return {
          avatarSize: 48,
          nameSize: 16,
          infoSize: 14,
        };
    }
  };

  const { avatarSize, nameSize, infoSize } = getSizeStyles();

  return (
    <View style={[styles.container, style]}>
      {showAvatar && (
        <Image 
          source={{ 
            uri: profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80'
          }}
          style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
        />
      )}
      
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { fontSize: nameSize }]}>
          {profile.full_name || 'Nom non défini'}
        </Text>
        
        {showEmail && profile.email && (
          <Text style={[styles.info, { fontSize: infoSize }]}>
            {profile.email}
          </Text>
        )}
        
        {showPhone && profile.phone && (
          <Text style={[styles.info, { fontSize: infoSize }]}>
            {profile.phone}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  info: {
    color: '#666',
    marginBottom: 1,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
  },
}); 