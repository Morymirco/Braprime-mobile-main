import { supabase } from '../supabase/config';
import { SessionService } from './SessionService';

export interface Reservation {
  id: string;
  user_id: string;
  business_id: number;
  business_name: string;
  business_image?: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationData {
  business_id: number;
  date: string;
  time: string;
  guests: number;
  special_requests?: string;
}

export class ReservationService {
  /**
   * Récupérer toutes les réservations de l'utilisateur connecté
   */
  static async getUserReservations(): Promise<{ data: Reservation[]; error: string | null }> {
    try {
      // Utiliser la session locale au lieu de supabase.auth.getUser()
      const session = await SessionService.getSession();
      
      if (!session || !session.user) {
        console.log('❌ Aucune session utilisateur trouvée');
        return { data: [], error: 'Utilisateur non connecté' };
      }

      console.log('✅ Session utilisateur trouvée:', session.user.id);

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          business:businesses(id, name, cover_image, logo)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des réservations:', error);
        return { data: [], error: error.message };
      }

      const reservations: Reservation[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        business_id: item.business_id,
        business_name: item.business?.name || 'Commerce non trouvé',
        business_image: item.business?.cover_image || item.business?.logo,
        date: item.date,
        time: item.time,
        guests: item.guests,
        status: item.status,
        special_requests: item.special_requests,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      console.log('✅ Réservations récupérées:', reservations.length);
      return { data: reservations, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des réservations:', error);
      return { data: [], error: 'Erreur de connexion' };
    }
  }

  /**
   * Créer une nouvelle réservation
   */
  static async create(data: CreateReservationData): Promise<{ data: Reservation | null; error: string | null }> {
    try {
      // Utiliser la session locale au lieu de supabase.auth.getUser()
      const session = await SessionService.getSession();
      
      if (!session || !session.user) {
        console.log('❌ Aucune session utilisateur trouvée pour la création');
        return { data: null, error: 'Utilisateur non connecté' };
      }

      console.log('✅ Session utilisateur trouvée pour la création:', session.user.id);

      const reservationData = {
        user_id: session.user.id,
        business_id: data.business_id,
        date: data.date,
        time: data.time,
        guests: data.guests,
        status: 'pending' as const,
        special_requests: data.special_requests,
      };

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de la réservation:', error);
        return { data: null, error: error.message };
      }

      console.log('✅ Réservation créée avec succès:', reservation.id);
      return { data: reservation, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la réservation:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  }

  /**
   * Annuler une réservation
   */
  static async cancel(id: string): Promise<{ data: Reservation | null; error: string | null }> {
    try {
      // Utiliser la session locale au lieu de supabase.auth.getUser()
      const session = await SessionService.getSession();
      
      if (!session || !session.user) {
        console.log('❌ Aucune session utilisateur trouvée pour l\'annulation');
        return { data: null, error: 'Utilisateur non connecté' };
      }

      console.log('✅ Session utilisateur trouvée pour l\'annulation:', session.user.id);

      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de l\'annulation de la réservation:', error);
        return { data: null, error: error.message };
      }

      console.log('✅ Réservation annulée avec succès:', id);
      return { data: reservation, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation de la réservation:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  }

  /**
   * Confirmer une réservation (pour les restaurants)
   */
  static async confirm(id: string): Promise<{ data: Reservation | null; error: string | null }> {
    try {
      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la confirmation de la réservation:', error);
        return { data: null, error: error.message };
      }

      return { data: reservation, error: null };
    } catch (error) {
      console.error('Erreur lors de la confirmation de la réservation:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  }

  /**
   * Marquer une réservation comme terminée
   */
  static async complete(id: string): Promise<{ data: Reservation | null; error: string | null }> {
    try {
      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la finalisation de la réservation:', error);
        return { data: null, error: error.message };
      }

      return { data: reservation, error: null };
    } catch (error) {
      console.error('Erreur lors de la finalisation de la réservation:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  }
} 