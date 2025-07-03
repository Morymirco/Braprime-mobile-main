import { MaterialIcons } from '@expo/vector-icons';
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

export default function TermsScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions et Services</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
          <Text style={styles.paragraph}>
            En utilisant l'application BraPrime, vous acceptez d'être lié par ces conditions d'utilisation. 
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description du service</Text>
          <Text style={styles.paragraph}>
            BraPrime est une plateforme de livraison et de services qui connecte les utilisateurs 
            avec des restaurants, commerces et prestataires de services en Guinée. Notre service 
            comprend la commande de nourriture, la livraison, les réservations et d'autres services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Compte utilisateur</Text>
          <Text style={styles.paragraph}>
            Pour utiliser certains services, vous devez créer un compte. Vous êtes responsable 
            de maintenir la confidentialité de vos informations de connexion et de toutes les 
            activités qui se produisent sous votre compte.
          </Text>
          <Text style={styles.paragraph}>
            Vous devez fournir des informations exactes et à jour lors de la création de votre compte.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Commandes et paiements</Text>
          <Text style={styles.paragraph}>
            Toutes les commandes passées via BraPrime sont soumises à disponibilité et à l'acceptation 
            du restaurant ou du prestataire de services.
          </Text>
          <Text style={styles.paragraph}>
            Les prix affichés incluent les taxes applicables. Les frais de livraison peuvent s'appliquer 
            selon votre localisation et le restaurant choisi.
          </Text>
          <Text style={styles.paragraph}>
            Nous acceptons les paiements en espèces à la livraison et les paiements mobiles (Orange Money, MTN Money).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Livraison</Text>
          <Text style={styles.paragraph}>
            Les délais de livraison sont estimés et peuvent varier selon les conditions météorologiques, 
            le trafic et d'autres facteurs indépendants de notre volonté.
          </Text>
          <Text style={styles.paragraph}>
            Vous devez être présent à l'adresse de livraison spécifiée au moment de la livraison. 
            Si vous n'êtes pas disponible, le livreur peut laisser votre commande à un endroit sûr 
            ou la retourner au restaurant.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Annulations et remboursements</Text>
          <Text style={styles.paragraph}>
            Vous pouvez annuler votre commande tant qu'elle n'a pas été confirmée par le restaurant. 
            Une fois confirmée, l'annulation peut être soumise à des frais selon la politique du restaurant.
          </Text>
          <Text style={styles.paragraph}>
            En cas de problème avec votre commande, contactez notre service client dans les 24 heures 
            suivant la livraison pour demander un remboursement ou un échange.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Utilisation acceptable</Text>
          <Text style={styles.paragraph}>
            Vous vous engagez à utiliser BraPrime uniquement à des fins légales et conformes à ces conditions. 
            Il est interdit d'utiliser notre service pour :
          </Text>
          <Text style={styles.bulletPoint}>• Violer les lois locales, nationales ou internationales</Text>
          <Text style={styles.bulletPoint}>• Harceler, menacer ou intimider d'autres utilisateurs</Text>
          <Text style={styles.bulletPoint}>• Transmettre du contenu offensant ou inapproprié</Text>
          <Text style={styles.bulletPoint}>• Tenter d'accéder non autorisé à nos systèmes</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Propriété intellectuelle</Text>
          <Text style={styles.paragraph}>
            BraPrime et son contenu, y compris mais sans s'y limiter, les textes, graphiques, logos, 
            icônes et logiciels, sont protégés par les droits d'auteur et autres lois sur la propriété intellectuelle.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Limitation de responsabilité</Text>
          <Text style={styles.paragraph}>
            BraPrime agit comme intermédiaire entre vous et les restaurants/prestataires de services. 
            Nous ne sommes pas responsables de la qualité des produits ou services fournis par les tiers.
          </Text>
          <Text style={styles.paragraph}>
            Dans toute la mesure permise par la loi, BraPrime ne sera pas responsable des dommages 
            indirects, accessoires ou consécutifs résultant de l'utilisation de notre service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Modifications des conditions</Text>
          <Text style={styles.paragraph}>
            Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications 
            entrent en vigueur immédiatement après leur publication sur l'application.
          </Text>
          <Text style={styles.paragraph}>
            Il est de votre responsabilité de consulter régulièrement ces conditions pour prendre 
            connaissance des modifications.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact</Text>
          <Text style={styles.paragraph}>
            Pour toute question concernant ces conditions, contactez-nous à :
          </Text>
          <Text style={styles.contactInfo}>Email: support@braprime.com</Text>
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