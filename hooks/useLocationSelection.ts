import { useCallback, useState } from 'react';
import { locationService, type Location } from '../lib/services/LocationService';
import { useToast } from './useToast';

const useLocationSelection = () => {
  const { showToast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Sélectionner une adresse depuis la page de sélection
   */
  const selectLocation = useCallback((location: Location) => {
    setSelectedLocation(location);
    showToast('success', 'Adresse sélectionnée avec succès');
  }, [showToast]);

  /**
   * Valider une adresse
   */
  const validateLocation = useCallback((location: Location): boolean => {
    if (!location.address || !location.address.trim()) {
      showToast('error', 'Veuillez sélectionner une adresse valide');
      return false;
    }

    if (!location.neighborhood || !location.neighborhood.trim()) {
      showToast('error', 'Quartier requis');
      return false;
    }

    if (location.latitude === 0 && location.longitude === 0) {
      showToast('error', 'Coordonnées GPS invalides');
      return false;
    }

    return true;
  }, [showToast]);

  /**
   * Calculer les frais de livraison basés sur la distance
   */
  const calculateDeliveryFee = useCallback((businessLocation: { lat: number; lng: number }, baseFee: number = 15000): number => {
    if (!selectedLocation) return baseFee;

    const distance = locationService.calculateDistance(
      businessLocation.lat,
      businessLocation.lng,
      selectedLocation.latitude,
      selectedLocation.longitude
    );

    // Tarification basée sur la distance
    if (distance <= 2) return baseFee; // 0-2km: frais de base
    if (distance <= 5) return baseFee + 5000; // 2-5km: +5000 GNF
    if (distance <= 10) return baseFee + 10000; // 5-10km: +10000 GNF
    return baseFee + 15000; // >10km: +15000 GNF
  }, [selectedLocation]);

  /**
   * Obtenir le temps de livraison estimé
   */
  const getEstimatedDeliveryTime = useCallback((businessLocation: { lat: number; lng: number }): string => {
    if (!selectedLocation) return '30-45 min';

    const distance = locationService.calculateDistance(
      businessLocation.lat,
      businessLocation.lng,
      selectedLocation.latitude,
      selectedLocation.longitude
    );

    // Estimation basée sur la distance
    if (distance <= 2) return '20-30 min';
    if (distance <= 5) return '30-45 min';
    if (distance <= 10) return '45-60 min';
    return '60-90 min';
  }, [selectedLocation]);

  /**
   * Vérifier si la livraison est possible
   */
  const isDeliveryAvailable = useCallback((businessLocation: { lat: number; lng: number }, maxDistance: number = 20): boolean => {
    if (!selectedLocation) return false;

    const distance = locationService.calculateDistance(
      businessLocation.lat,
      businessLocation.lng,
      selectedLocation.latitude,
      selectedLocation.longitude
    );

    return distance <= maxDistance;
  }, [selectedLocation]);

  /**
   * Réinitialiser la sélection
   */
  const resetLocation = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  /**
   * Mettre à jour le point de repère
   */
  const updateLandmark = useCallback((landmark: string) => {
    if (selectedLocation) {
      setSelectedLocation(prev => prev ? { ...prev, landmark } : null);
    }
  }, [selectedLocation]);

  return {
    selectedLocation,
    isLoading,
    selectLocation,
    validateLocation,
    calculateDeliveryFee,
    getEstimatedDeliveryTime,
    isDeliveryAvailable,
    resetLocation,
    updateLandmark,
    setSelectedLocation
  };
};

export default useLocationSelection; 