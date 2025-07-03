import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapWebViewProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: number;
}

export default function MapWebView({ 
  latitude = 9.5370, 
  longitude = -13.6785, 
  onLocationSelect,
  height = 300 
}: MapWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body, html { 
          margin: 0; 
          padding: 0; 
          height: 100%; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
        }
        .loading-text {
          color: #666;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      
      <script>
        let map;
        let marker;
        
        function initMap() {
          const conakry = { lat: ${latitude}, lng: ${longitude} };
          
          map = new google.maps.Map(document.getElementById("map"), {
            zoom: 13,
            center: conakry,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });
          
          // Marqueur initial
          marker = new google.maps.Marker({
            position: conakry,
            map: map,
            draggable: true,
            title: "Emplacement sélectionné"
          });
          
          // Écouter les clics sur la carte
          map.addListener("click", function(event) {
            const position = event.latLng;
            marker.setPosition(position);
            
            // Envoyer les coordonnées à React Native
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'location_selected',
                latitude: position.lat(),
                longitude: position.lng()
              }));
            }
          });
          
          // Écouter le drag du marqueur
          marker.addListener("dragend", function(event) {
            const position = event.latLng;
            
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'location_selected',
                latitude: position.lat(),
                longitude: position.lng()
              }));
            }
          });
          
          // Notifier que la carte est chargée
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'map_loaded'
            }));
          }
        }
        
        // Gérer les erreurs de chargement
        window.addEventListener('error', function(e) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: 'Erreur de chargement de la carte'
            }));
          }
        });
      </script>
      
      <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap">
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'location_selected' && onLocationSelect) {
        onLocationSelect(data.latitude, data.longitude);
      } else if (data.type === 'map_loaded') {
        setIsLoading(false);
      } else if (data.type === 'error') {
        console.error('Erreur de carte:', data.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors du parsing du message:', error);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31837" />
          <Text style={styles.loadingText}>Chargement de la carte...</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={false}
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
}); 