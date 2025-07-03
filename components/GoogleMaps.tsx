import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface GoogleMapsProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: number;
  apiKey?: string;
}

export default function GoogleMaps({ 
  latitude = 9.5370, 
  longitude = -13.6785, 
  onLocationSelect,
  height = 300,
  apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAaZ74jJVrh-FTSerYhYWzJ6Jxif8L18pM'
}: GoogleMapsProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  console.log('🗺️ GoogleMaps component initialized with:', {
    latitude,
    longitude,
    height,
    apiKey: apiKey ? 'API Key provided' : 'No API Key',
    hasOnLocationSelect: !!onLocationSelect
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <style>
        body, html { 
          margin: 0; 
          padding: 0; 
          height: 100%; 
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow: hidden;
        }
        #map { 
          width: 100%; 
          height: 100%; 
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          background: #f5f5f5;
          color: #666;
          font-size: 16px;
        }
        .error {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          background: #ffebee;
          color: #c62828;
          font-size: 14px;
          text-align: center;
          padding: 20px;
        }
        .map-instructions {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          color: #333;
          z-index: 1000;
        }
        .debug-info {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          z-index: 1000;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="map-instructions">
        Cliquez sur la carte pour sélectionner un emplacement
      </div>
      <div class="debug-info" id="debug-info">
        Chargement...
      </div>
      
      <script>
        console.log('🌐 Google Maps HTML loaded');
        console.log('📍 Coordinates:', { lat: ${latitude}, lng: ${longitude} });
        console.log('🔑 API Key:', '${apiKey}');
        
        let map;
        let marker;
        let infoWindow;
        let debugInfo = document.getElementById('debug-info');
        
        function updateDebugInfo(message) {
          console.log('🔍 Debug:', message);
          if (debugInfo) {
            debugInfo.textContent = message;
          }
        }
        
        function initMap() {
          try {
            console.log('🗺️ Initializing Google Maps...');
            updateDebugInfo('Initialisation...');
            
            const conakry = { lat: ${latitude}, lng: ${longitude} };
            console.log('📍 Center coordinates:', conakry);
            
            // Créer la carte Google Maps
            map = new google.maps.Map(document.getElementById('map'), {
              center: conakry,
              zoom: 13,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              zoomControl: true,
              mapTypeControl: false,
              scaleControl: true,
              streetViewControl: false,
              rotateControl: false,
              fullscreenControl: false,
              gestureHandling: 'cooperative'
            });
            
            console.log('🗺️ Map created successfully');
            updateDebugInfo('Carte créée');
            
            // Marqueur initial
            marker = new google.maps.Marker({
              position: conakry,
              map: map,
              draggable: true,
              title: "Emplacement sélectionné"
            });
            
            console.log('📍 Marker created successfully');
            updateDebugInfo('Marqueur créé');
            
            // InfoWindow pour afficher les coordonnées
            infoWindow = new google.maps.InfoWindow({
              content: "Emplacement sélectionné"
            });
            
            // Écouter les clics sur la carte
            map.addListener("click", function(event) {
              const position = event.latLng;
              console.log('🖱️ Map clicked at:', { lat: position.lat(), lng: position.lng() });
              
              marker.setPosition(position);
              infoWindow.setContent(
                "Lat: " + position.lat().toFixed(6) + "<br>" +
                "Lng: " + position.lng().toFixed(6)
              );
              infoWindow.open(map, marker);
              
              // Envoyer les coordonnées à React Native
              if (window.ReactNativeWebView) {
                const message = {
                  type: 'location_selected',
                  latitude: position.lat(),
                  longitude: position.lng()
                };
                console.log('📤 Sending to React Native:', message);
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
              } else {
                console.warn('⚠️ ReactNativeWebView not available');
              }
            });
            
            // Écouter le drag du marqueur
            marker.addListener("dragend", function(event) {
              const position = event.latLng;
              console.log('🎯 Marker dragged to:', { lat: position.lat(), lng: position.lng() });
              
              infoWindow.setContent(
                "Lat: " + position.lat().toFixed(6) + "<br>" +
                "Lng: " + position.lng().toFixed(6)
              );
              infoWindow.open(map, marker);
              
              if (window.ReactNativeWebView) {
                const message = {
                  type: 'location_selected',
                  latitude: position.lat(),
                  longitude: position.lng()
                };
                console.log('📤 Sending to React Native:', message);
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
              }
            });
            
            // Notifier que la carte est chargée
            if (window.ReactNativeWebView) {
              const message = { type: 'map_loaded' };
              console.log('✅ Map loaded, sending to React Native:', message);
              window.ReactNativeWebView.postMessage(JSON.stringify(message));
              updateDebugInfo('Carte chargée ✅');
            } else {
              console.warn('⚠️ ReactNativeWebView not available for map_loaded');
            }
            
            console.log('🎉 Google Maps initialization complete');
            
          } catch (error) {
            console.error('❌ Error during Google Maps initialization:', error);
            updateDebugInfo('Erreur: ' + error.message);
            
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: 'Erreur lors de l\'initialisation de Google Maps: ' + error.message
              }));
            }
          }
        }
        
        // Gérer les erreurs de chargement
        window.addEventListener('error', function(e) {
          console.error('❌ Window error:', e);
          updateDebugInfo('Erreur window: ' + e.message);
          
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: 'Erreur de chargement de Google Maps: ' + e.message
            }));
          }
        });
        
        // Vérifier si ReactNativeWebView est disponible
        if (window.ReactNativeWebView) {
          console.log('✅ ReactNativeWebView is available');
        } else {
          console.warn('⚠️ ReactNativeWebView is not available');
        }
        
        console.log('📋 HTML setup complete, waiting for Google Maps API...');
      </script>
      
      <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap"
        onerror="console.error('❌ Failed to load Google Maps API script')">
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      console.log('📨 Raw message from WebView:', event.nativeEvent.data);
      
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📨 Parsed message from Google Maps:', data);
      
      if (data.type === 'location_selected' && onLocationSelect) {
        console.log('📍 Location selected:', { lat: data.latitude, lng: data.longitude });
        onLocationSelect(data.latitude, data.longitude);
      } else if (data.type === 'map_loaded') {
        console.log('✅ Map loaded successfully');
        setIsLoading(false);
        setHasError(false);
      } else if (data.type === 'error') {
        console.error('❌ Google Maps error:', data.message);
        setIsLoading(false);
        setHasError(true);
      } else {
        console.log('📨 Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('❌ Error parsing WebView message:', error);
      console.error('❌ Raw message was:', event.nativeEvent.data);
    }
  };

  const handleLoadStart = () => {
    console.log('🌐 Google Maps WebView: Load start');
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    console.log('🌐 Google Maps WebView: Load end');
  };

  const handleError = (error: any) => {
    console.error('❌ Google Maps WebView: Load error:', error);
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[styles.container, { height }]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31837" />
          <Text style={styles.loadingText}>Chargement de Google Maps...</Text>
        </View>
      )}
      
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Erreur de chargement de Google Maps
          </Text>
          <Text style={styles.errorSubtext}>
            Vérifiez votre clé API et votre connexion internet
          </Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        bounces={false}
        scrollEnabled={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        onShouldStartLoadWithRequest={() => true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    zIndex: 1,
  },
  errorText: {
    marginBottom: 12,
    fontSize: 16,
    color: '#c62828',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
  },
}); 