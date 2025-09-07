import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Politique de Confidentialité</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            BraPrime s'engage à protéger votre vie privée. Cette politique de confidentialité 
            explique comment nous collectons, utilisons et protégeons vos informations personnelles 
            lorsque vous utilisez notre application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Informations que nous collectons</Text>
          <Text style={styles.subsectionTitle}>Informations personnelles :</Text>
          <Text style={styles.paragraph}>
            • Nom et prénom{'\n'}
            • Adresse email{'\n'}
            • Numéro de téléphone{'\n'}
            • Adresse de livraison{'\n'}
            • Informations de paiement
          </Text>
          
          <Text style={styles.subsectionTitle}>Informations techniques :</Text>
          <Text style={styles.paragraph}>
            • Adresse IP{'\n'}
            • Type d'appareil et système d'exploitation{'\n'}
            • Données de localisation (avec votre consentement){'\n'}
            • Historique de navigation et d'utilisation
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Comment nous utilisons vos informations</Text>
          <Text style={styles.paragraph}>
            Nous utilisons vos informations pour :
          </Text>
          <Text style={styles.bulletPoint}>• Traiter vos commandes et réservations</Text>
          <Text style={styles.bulletPoint}>• Vous fournir un service de livraison</Text>
          <Text style={styles.bulletPoint}>• Communiquer avec vous concernant vos commandes</Text>
          <Text style={styles.bulletPoint}>• Améliorer nos services et l'expérience utilisateur</Text>
          <Text style={styles.bulletPoint}>• Envoyer des notifications importantes</Text>
          <Text style={styles.bulletPoint}>• Prévenir la fraude et assurer la sécurité</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Partage des informations</Text>
          <Text style={styles.paragraph}>
            Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. 
            Nous pouvons partager vos informations uniquement dans les cas suivants :
          </Text>
          <Text style={styles.bulletPoint}>• Avec les restaurants et livreurs pour traiter vos commandes</Text>
          <Text style={styles.bulletPoint}>• Avec nos prestataires de services (paiement, analyse)</Text>
          <Text style={styles.bulletPoint}>• Lorsque requis par la loi ou pour protéger nos droits</Text>
          <Text style={styles.bulletPoint}>• Avec votre consentement explicite</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Sécurité des données</Text>
          <Text style={styles.paragraph}>
            Nous mettons en place des mesures de sécurité appropriées pour protéger vos informations :
          </Text>
          <Text style={styles.bulletPoint}>• Chiffrement des données sensibles</Text>
          <Text style={styles.bulletPoint}>• Accès restreint aux informations personnelles</Text>
          <Text style={styles.bulletPoint}>• Surveillance continue de nos systèmes</Text>
          <Text style={styles.bulletPoint}>• Formation du personnel sur la protection des données</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Conservation des données</Text>
          <Text style={styles.paragraph}>
            Nous conservons vos informations personnelles aussi longtemps que nécessaire 
            pour fournir nos services et respecter nos obligations légales. 
            Les données peuvent être conservées pour :
          </Text>
          <Text style={styles.bulletPoint}>• Traitement des commandes et support client</Text>
          <Text style={styles.bulletPoint}>• Respect des obligations fiscales et légales</Text>
          <Text style={styles.bulletPoint}>• Amélioration de nos services</Text>
          <Text style={styles.bulletPoint}>• Prévention de la fraude</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Vos droits</Text>
          <Text style={styles.paragraph}>
            Conformément à la réglementation sur la protection des données, vous avez le droit de :
          </Text>
          <Text style={styles.bulletPoint}>• Accéder à vos informations personnelles</Text>
          <Text style={styles.bulletPoint}>• Corriger des informations inexactes</Text>
          <Text style={styles.bulletPoint}>• Demander la suppression de vos données</Text>
          <Text style={styles.bulletPoint}>• Limiter le traitement de vos données</Text>
          <Text style={styles.bulletPoint}>• Vous opposer au traitement de vos données</Text>
          <Text style={styles.bulletPoint}>• Demander la portabilité de vos données</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Cookies et technologies similaires</Text>
          <Text style={styles.paragraph}>
            Nous utilisons des cookies et des technologies similaires pour :
          </Text>
          <Text style={styles.bulletPoint}>• Mémoriser vos préférences</Text>
          <Text style={styles.bulletPoint}>• Analyser l'utilisation de l'application</Text>
          <Text style={styles.bulletPoint}>• Améliorer nos services</Text>
          <Text style={styles.bulletPoint}>• Personnaliser votre expérience</Text>
          <Text style={styles.paragraph}>
            Vous pouvez contrôler l'utilisation des cookies dans les paramètres de votre appareil.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Transferts internationaux</Text>
          <Text style={styles.paragraph}>
            Vos informations peuvent être transférées et traitées dans des pays autres que la Guinée. 
            Nous nous assurons que ces transferts respectent les standards de protection des données 
            appropriés et que vos informations restent protégées.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Modifications de cette politique</Text>
          <Text style={styles.paragraph}>
            Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. 
            Les modifications importantes seront notifiées via l'application ou par email.
          </Text>
          <Text style={styles.paragraph}>
            Nous vous encourageons à consulter régulièrement cette politique pour rester 
            informé de nos pratiques de protection des données.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact</Text>
          <Text style={styles.paragraph}>
            Si vous avez des questions concernant cette politique de confidentialité 
            ou souhaitez exercer vos droits, contactez-nous :
          </Text>
          <Text style={styles.contactInfo}>Email: privacy@braprime.com</Text>
          <Text style={styles.contactInfo}>Téléphone: +224 XXX XXX XXX</Text>
          <Text style={styles.contactInfo}>Adresse: Conakry, Guinée</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.lastUpdated}>
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginLeft: 16,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 16,
    lineHeight: 24,
    color: '#E31837',
    fontWeight: '500',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
}); 