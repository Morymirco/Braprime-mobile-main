import { useEffect, useState } from 'react';
import { CreateReservationData, Reservation, ReservationService } from '../lib/services/ReservationService';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les réservations de l'utilisateur
  const loadReservations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await ReservationService.getUserReservations();
      
      if (error) {
        setError(error);
        setReservations([]);
      } else {
        setReservations(data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des réservations');
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Créer une nouvelle réservation
  const createReservation = async (data: CreateReservationData): Promise<{ success: boolean; error?: string; reservation?: Reservation }> => {
    try {
      const { data: reservation, error } = await ReservationService.create(data);
      
      if (error) {
        return { success: false, error };
      }

      if (reservation) {
        setReservations(prev => [reservation, ...prev]);
        return { success: true, reservation };
      }

      return { success: false, error: 'Erreur lors de la création de la réservation' };
    } catch (err) {
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  // Annuler une réservation
  const cancelReservation = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: reservation, error } = await ReservationService.cancel(id);
      
      if (error) {
        return { success: false, error };
      }

      if (reservation) {
        setReservations(prev => 
          prev.map(res => res.id === id ? reservation : res)
        );
        return { success: true };
      }

      return { success: false, error: 'Erreur lors de l\'annulation' };
    } catch (err) {
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  // Charger les réservations au montage du composant
  useEffect(() => {
    loadReservations();
  }, []);

  return {
    reservations,
    isLoading,
    error,
    loadReservations,
    createReservation,
    cancelReservation
  };
}; 