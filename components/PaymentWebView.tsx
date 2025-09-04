import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useToast } from '../lib/contexts/ToastContext';

interface PaymentWebViewProps {
  paymentUrl: string;
  onPaymentSuccess: (payId: string) => void;
  onPaymentError: (error: string) => void;
  onClose: () => void;
}

export default function PaymentWebView({
  paymentUrl,
  onPaymentSuccess,
  onPaymentError,
  onClose,
}: PaymentWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const { showToast } = useToast();

  // Gérer le bouton retour Android et la status bar
  React.useEffect(() => {
    // Configurer la status bar pour le paiement
    RNStatusBar.setBarStyle('dark-content', true);
    RNStatusBar.setBackgroundColor('#ffffff', true);

    const backAction = () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      } else {
        onClose();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    // Cleanup: restaurer la status bar
    return () => {
      backHandler.remove();
      RNStatusBar.setBarStyle('dark-content', true);
      RNStatusBar.setBackgroundColor('#f5f5f5', true);
    };
  }, [canGoBack, onClose]);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setLoading(navState.loading);

    // Vérifier si l'URL contient des paramètres de succès/échec
    const url = navState.url;
    console.log('🔍 PaymentWebView: Navigation vers:', url);

    // Détecter les URLs de retour de Lengo Pay (plusieurs formats possibles)
    if (url.includes('payment-success') || 
        url.includes('success=true') || 
        url.includes('braprime://payment-success') ||
        url.includes('order-confirmation') ||
        url.includes('status=success')) {
      
      // Extraire le pay_id de l'URL ou des paramètres
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const payId = urlParams.get('pay_id') || 
                   urlParams.get('transaction_id') || 
                   urlParams.get('payment_id') ||
                   urlParams.get('order_id'); // Utiliser order_id comme fallback
      
      // Si c'est une redirection vers order-confirmation, le paiement Lengo Pay a réussi
      if (url.includes('order-confirmation')) {
        console.log('✅ PaymentWebView: Redirection vers order-confirmation détectée - Paiement Lengo Pay réussi');
        onPaymentSuccess(payId || 'lengo_success');
      } else if (payId) {
        console.log('✅ PaymentWebView: Paiement réussi avec pay_id:', payId);
        onPaymentSuccess(payId);
      } else {
        console.log('⚠️ PaymentWebView: Paiement réussi mais pas de pay_id trouvé');
        onPaymentSuccess('unknown_success');
      }
      
    } else if (url.includes('payment-failed') || 
               url.includes('error=true') || 
               url.includes('cancel=true') ||
               url.includes('braprime://payment-cancel') ||
               url.includes('status=failed') ||
               url.includes('status=cancelled')) {
      
      console.log('❌ PaymentWebView: Paiement échoué ou annulé');
      onPaymentError('Paiement annulé ou échoué');
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('🔍 PaymentWebView: Message reçu:', data);

      if (data.type === 'payment_success') {
        onPaymentSuccess(data.pay_id || 'unknown');
      } else if (data.type === 'payment_error') {
        onPaymentError(data.error || 'Erreur de paiement');
      }
    } catch (error) {
      console.log('⚠️ PaymentWebView: Erreur lors du parsing du message:', error);
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('❌ PaymentWebView: Erreur de chargement:', nativeEvent);
    showToast('error', 'Erreur de chargement de la page de paiement');
  };

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleGoBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      onClose();
    }
  };

  const handleRefresh = () => {
    webViewRef.current?.reload();
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar style="dark" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
          <MaterialIcons 
            name={canGoBack ? "arrow-back" : "close"} 
            size={24} 
            color="#000" 
          />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Paiement sécurisé</Text>
          <Text style={styles.headerSubtitle}>Lengo Pay</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Indicateur de chargement */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31837" />
          <Text style={styles.loadingText}>Chargement de la page de paiement...</Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        style={styles.webView}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Injecter du JavaScript pour détecter les événements de paiement
        injectedJavaScript={`
          // Détecter les changements d'URL et envoyer des messages
          let currentUrl = window.location.href;
          
          // Fonction pour vérifier le statut du paiement
          function checkPaymentStatus() {
            const url = window.location.href;
            const params = new URLSearchParams(window.location.search);
            
            console.log('🔍 WebView JS: Vérification URL:', url);
            
            // Détecter les URLs de succès (plusieurs formats)
            if (url.includes('success') || 
                url.includes('payment-success') ||
                url.includes('order-confirmation') ||
                url.includes('braprime://payment-success') ||
                params.get('status') === 'success') {
              
              const payId = params.get('pay_id') || 
                           params.get('transaction_id') || 
                           params.get('payment_id') ||
                           params.get('order_id');
              
              // Si c'est une redirection vers order-confirmation, le paiement Lengo Pay a réussi
              if (url.includes('order-confirmation')) {
                console.log('✅ WebView JS: Redirection vers order-confirmation - Paiement Lengo Pay réussi');
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'payment_success',
                  pay_id: payId || 'lengo_success',
                  is_lengo_payment: true
                }));
              } else {
                console.log('✅ WebView JS: Paiement réussi, pay_id:', payId);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'payment_success',
                  pay_id: payId || 'unknown_success'
                }));
              }
              
            } else if (url.includes('error') || 
                       url.includes('failed') || 
                       url.includes('cancel') ||
                       url.includes('payment-failed') ||
                       url.includes('braprime://payment-cancel') ||
                       params.get('status') === 'failed' ||
                       params.get('status') === 'cancelled') {
              
              console.log('❌ WebView JS: Paiement échoué ou annulé');
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_error',
                error: 'Paiement échoué ou annulé'
              }));
            }
          }
          
          // Vérifier immédiatement
          checkPaymentStatus();
          
          // Vérifier à chaque changement d'URL
          const observer = new MutationObserver(checkPaymentStatus);
          observer.observe(document.body, { childList: true, subtree: true });
          
          // Vérifier périodiquement
          setInterval(checkPaymentStatus, 1000);
          
          // Écouter les changements d'URL
          window.addEventListener('popstate', checkPaymentStatus);
          
          true; // Note: this is required, or you'll sometimes get silent failures
        `}
      />

      {/* Footer avec informations */}
      <View style={styles.footer}>
        <View style={styles.securityInfo}>
          <MaterialIcons name="security" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>Paiement sécurisé par Lengo Pay</Text>
        </View>
        <Text style={styles.footerText}>
          Vos informations de paiement sont protégées par un cryptage SSL
        </Text>
        
        {/* Indicateur de progression */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: loading ? '30%' : '100%' }]} />
          </View>
          <Text style={styles.progressText}>
            {loading ? 'Chargement...' : 'Prêt pour le paiement'}
          </Text>
        </View>
      </View>
    </View>
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
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  webView: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});
