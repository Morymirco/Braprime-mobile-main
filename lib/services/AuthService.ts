import { supabase } from '../supabase/config';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'customer';
  phone_number?: string;
  address?: string;
  profile_image?: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone_number?: string;
  address?: string;
}

export interface SignupResult {
  user: AuthUser | null;
  error: string | null;
}

export interface LoginResult {
  user: AuthUser | null;
  error: string | null;
}

export class AuthService {
  // Inscription d'un nouvel utilisateur (clients uniquement)
  static async signup(userData: SignupData): Promise<SignupResult> {
    try {
      console.log('🚀 [AuthService] Début de l\'inscription client pour:', userData.email);
      
      // Vérifier que le rôle customer existe dans la base de données
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, name')
        .eq('name', 'customer')
        .single();

      if (rolesError) {
        console.error('❌ [AuthService] Erreur lors de la récupération du rôle customer:', rolesError);
        return { user: null, error: 'Erreur de configuration des rôles' };
      }

      console.log('✅ [AuthService] Rôle customer trouvé:', roles);
      
      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: 'customer',
            phone_number: userData.phone_number,
            address: userData.address,
          }
        }
      });

      if (authError) {
        console.error('❌ [AuthService] Erreur Supabase Auth:', authError);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        console.error('❌ [AuthService] Aucun utilisateur créé dans auth');
        return { user: null, error: 'Erreur lors de la création du compte' };
      }

      console.log('✅ [AuthService] Utilisateur auth créé avec succès:', authData.user.id);

      const roleId = roles.id;
      console.log('🔧 [AuthService] Utilisation du rôle customer avec ID:', roleId);

      const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`;

      console.log('🔧 [AuthService] Création du profil utilisateur avec role_id:', roleId);
      
      // Créer le profil utilisateur dans user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role_id: roleId,
          phone_number: userData.phone_number,
          address: userData.address,
          profile_image: profileImage,
          is_verified: false,
          is_manual_creation: false
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ [AuthService] Erreur lors de la création du profil:', profileError);
        // Essayer de supprimer l'utilisateur auth
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('❌ [AuthService] Erreur lors de la suppression de l\'utilisateur auth:', deleteError);
        }
        return { user: null, error: 'Erreur lors de la création du profil utilisateur' };
      }

      console.log('✅ [AuthService] Profil utilisateur créé avec succès:', profile.id);

      // Construire l'utilisateur de retour
      const user: AuthUser = {
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        role: 'customer',
        phone_number: userData.phone_number,
        address: userData.address,
        profile_image: profileImage
      };

      console.log('✅ [AuthService] Inscription client réussie pour:', user.email);
      return { user, error: null };

    } catch (error) {
      console.error('❌ [AuthService] Erreur inattendue lors de l\'inscription:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite' 
      };
    }
  }

  // Connexion d'un utilisateur
  static async login(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('🚀 [AuthService] Tentative de connexion pour:', email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('❌ [AuthService] Erreur de connexion:', authError);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        console.error('❌ [AuthService] Aucun utilisateur retourné');
        return { user: null, error: 'Erreur lors de la connexion' };
      }

      // Récupérer le profil utilisateur complet
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles(name)
        `)
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ [AuthService] Erreur lors de la récupération du profil:', profileError);
        return { user: null, error: 'Erreur lors de la récupération du profil' };
      }

      // Vérifier que l'utilisateur est bien un client
      if (profile.user_roles?.name !== 'customer') {
        console.error('❌ [AuthService] Utilisateur non autorisé (rôle non client):', profile.user_roles?.name);
        return { user: null, error: 'Type de compte non autorisé' };
      }

      const user: AuthUser = {
        id: authData.user.id,
          email: profile.email,
          name: profile.name,
        role: 'customer',
          phone_number: profile.phone_number,
          address: profile.address,
          profile_image: profile.profile_image
      };

      console.log('✅ [AuthService] Connexion client réussie pour:', user.email);
      return { user, error: null };

    } catch (error) {
      console.error('❌ [AuthService] Erreur inattendue lors de la connexion:', error);
      return { user: null, error: 'Une erreur inattendue s\'est produite' };
    }
  }

  // Déconnexion
  static async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ [AuthService] Erreur lors de la déconnexion:', error);
        return { error: error.message || 'Erreur lors de la déconnexion' };
      } else {
        console.log('✅ [AuthService] Déconnexion réussie');
        return { error: null };
      }
    } catch (error) {
      console.error('❌ [AuthService] Erreur inattendue lors de la déconnexion:', error);
      return { error: error instanceof Error ? error.message : 'Erreur inattendue lors de la déconnexion' };
    }
  }

  // Récupérer l'utilisateur actuel
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return { user: null, error: authError?.message || 'Utilisateur non connecté' };
      }

      // Récupérer le profil utilisateur complet
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles(name)
        `)
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('❌ [AuthService] Erreur lors de la récupération du profil:', profileError);
        return { user: null, error: 'Erreur lors de la récupération du profil' };
      }

      // Vérifier que l'utilisateur est bien un client
      if (profile.user_roles?.name !== 'customer') {
        console.error('❌ [AuthService] Utilisateur non autorisé (rôle non client):', profile.user_roles?.name);
        return { user: null, error: 'Type de compte non autorisé' };
      }

      const user: AuthUser = {
        id: authUser.id,
          email: profile.email,
          name: profile.name,
        role: 'customer',
          phone_number: profile.phone_number,
          address: profile.address,
          profile_image: profile.profile_image
      };

      return { user, error: null };

    } catch (error) {
      console.error('❌ [AuthService] Erreur lors de la récupération de l\'utilisateur actuel:', error);
      return { user: null, error: 'Erreur lors de la récupération de l\'utilisateur' };
    }
  }

  // Écouter les changements d'état d'authentification
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { user } = await this.getCurrentUser();
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }

  // Récupérer la session Supabase actuelle
  static async getSupabaseSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { data, error };
    } catch (error) {
      console.error('❌ [AuthService] Erreur lors de la récupération de la session Supabase:', error);
      return { data: { session: null }, error };
    }
  }

  // Mettre à jour le profil utilisateur
  static async updateProfile(userId: string, updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('🚀 [AuthService] Mise à jour du profil pour:', userId);

      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.phone_number !== undefined) updateData.phone_number = updates.phone_number;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.profile_image) updateData.profile_image = updates.profile_image;

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (profileError) {
        console.error('❌ [AuthService] Erreur lors de la mise à jour du profil:', profileError);
        return { user: null, error: 'Erreur lors de la mise à jour du profil' };
      }

      const user: AuthUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: 'customer',
        phone_number: profile.phone_number,
        address: profile.address,
        profile_image: profile.profile_image
      };

      console.log('✅ [AuthService] Profil mis à jour avec succès');
      return { user, error: null };

    } catch (error) {
      console.error('❌ [AuthService] Erreur inattendue lors de la mise à jour du profil:', error);
      return { user: null, error: 'Une erreur inattendue s\'est produite' };
    }
  }
} 