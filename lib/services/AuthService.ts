import { supabase } from '../supabase/config'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'customer' | 'partner'
  phone_number?: string
  address?: string
  profile_image?: string
}

export class AuthService {
  // Inscription d'un nouvel utilisateur (clients uniquement)
  static async signup(userData: {
    email: string
    password: string
    name: string
    phone_number?: string
    address?: string
  }): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('Début de l\'inscription pour:', userData.email)
      
      // Vérifier d'abord si l'utilisateur existe déjà
      console.log('Vérification de l\'existence de l\'utilisateur...')
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      })

      if (existingUser.user) {
        console.log('Utilisateur existe déjà, tentative de connexion...')
        // L'utilisateur existe, essayer de se connecter
        return await this.login(userData.email, userData.password)
      }

      // Créer l'utilisateur dans Supabase Auth (rôle customer uniquement)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: 'customer', // Rôle fixe pour les clients
            phone_number: userData.phone_number,
            address: userData.address,
          }
        }
      })

      if (authError) {
        console.error('Erreur Supabase Auth:', authError)
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        console.error('Aucun utilisateur créé dans auth')
        return { user: null, error: 'Erreur lors de la création du compte' }
      }

      console.log('Utilisateur auth créé avec succès:', authData.user.id)

      // Créer manuellement le profil utilisateur dans user_profiles
      const roleId = 1 // Customer role
      const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`

      console.log('Création du profil utilisateur...')
      
      // Vérifier si le profil existe déjà avant de l'insérer
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', userData.email)
        .single()

      if (existingProfile) {
        console.log('Profil existant trouvé, mise à jour...')
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            name: userData.name,
            phone_number: userData.phone_number,
            address: userData.address,
            profile_image: profileImage,
            is_active: true
          })
          .eq('email', userData.email)
          .select()
          .single()

        if (updateError) {
          console.error('Erreur mise à jour profil:', updateError)
          return { user: null, error: `Erreur lors de la mise à jour du profil: ${updateError.message}` }
        }

        return { 
          user: {
            id: updatedProfile.id,
            email: updatedProfile.email,
            name: updatedProfile.name,
            role: 'customer',
            phone_number: updatedProfile.phone_number,
            address: updatedProfile.address,
            profile_image: updatedProfile.profile_image
          }, 
          error: null 
        }
      }

      // Créer un nouveau profil
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
          is_active: true
        })
        .select()
        .single()

      if (profileError) {
        console.error('Erreur création profil:', profileError)
        
        // Si c'est une erreur de doublon, essayer de récupérer le profil existant
        if (profileError.code === '23505') {
          console.log('Profil en doublon détecté, récupération du profil existant...')
          const { data: existingProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', userData.email)
            .single()

          if (existingProfile && !fetchError) {
            return { 
              user: {
                id: existingProfile.id,
                email: existingProfile.email,
                name: existingProfile.name,
                role: 'customer',
                phone_number: existingProfile.phone_number,
                address: existingProfile.address,
                profile_image: existingProfile.profile_image
              }, 
              error: null 
            }
          }
        }
        
        // Essayer de supprimer l'utilisateur auth si le profil n'a pas pu être créé
        try {
          await supabase.auth.admin.deleteUser(authData.user.id)
        } catch (deleteError) {
          console.error('Erreur lors de la suppression de l\'utilisateur auth:', deleteError)
        }
        
        return { user: null, error: `Erreur lors de la création du profil: ${profileError.message}` }
      }

      if (!profile) {
        return { user: null, error: 'Erreur lors de la création du profil' }
      }

      console.log('Profil utilisateur créé avec succès')

      return { 
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: 'customer',
          phone_number: profile.phone_number,
          address: profile.address,
          profile_image: profile.profile_image
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      return { user: null, error: 'Erreur lors de l\'inscription' }
    }
  }

  // Connexion d'un utilisateur
  static async login(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('Tentative de connexion pour:', email)
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('Erreur connexion:', authError)
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Utilisateur non trouvé' }
      }

      console.log('Connexion auth réussie, récupération du profil...')

      // Récupérer le profil utilisateur depuis user_profiles (SANS JOIN avec user_roles)
      let { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          email,
          phone_number,
          address,
          profile_image,
          role_id
        `)
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.error('Erreur récupération profil:', profileError)
        
        // Essayer de récupérer par email si l'ID ne correspond pas
        console.log('Tentative de récupération par email...')
        const { data: profileByEmail, error: emailError } = await supabase
          .from('user_profiles')
          .select(`
            id,
            name,
            email,
            phone_number,
            address,
            profile_image,
            role_id
          `)
          .eq('email', authData.user.email)
          .single()

        if (profileByEmail && !emailError) {
          console.log('Profil trouvé par email, mise à jour de l\'ID...')
          // Mettre à jour l'ID du profil pour correspondre à l'utilisateur auth
          const { data: updatedProfile, error: updateError } = await supabase
            .from('user_profiles')
            .update({ id: authData.user.id })
            .eq('email', authData.user.email)
            .select()
            .single()

          if (updatedProfile && !updateError) {
            profile = updatedProfile
          } else {
            profile = profileByEmail
          }
        } else {
          // Si le profil n'existe pas, le créer automatiquement
          console.log('Profil non trouvé, création automatique...')
          const roleId = authData.user.user_metadata?.role === 'partner' ? 2 : 1
          const name = authData.user.user_metadata?.name || 'Utilisateur'
          const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
          
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              name: name,
              email: authData.user.email || '',
              role_id: roleId,
              phone_number: authData.user.user_metadata?.phone_number,
              address: authData.user.user_metadata?.address,
              profile_image: profileImage,
              is_active: true
            })
            .select()
            .single()
            
          if (createError) {
            console.error('Erreur création profil automatique:', createError)
            // Retourner les données de base de l'utilisateur auth
            return { 
              user: {
                id: authData.user.id,
                email: authData.user.email || '',
                name: name,
                role: authData.user.user_metadata?.role || 'customer',
                phone_number: authData.user.user_metadata?.phone_number,
                address: authData.user.user_metadata?.address,
                profile_image: profileImage
              }, 
              error: null 
            }
          }
          
          profile = newProfile
        }
      }

      if (!profile) {
        return { user: null, error: 'Profil utilisateur non trouvé' }
      }

      // Déterminer le rôle basé sur role_id
      const role = profile.role_id === 2 ? 'partner' : 'customer'

      console.log('Connexion réussie pour:', profile.name)

      return { 
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: role,
          phone_number: profile.phone_number,
          address: profile.address,
          profile_image: profile.profile_image
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      return { user: null, error: 'Erreur lors de la connexion' }
    }
  }

  // Déconnexion
  static async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      return { error: 'Erreur lors de la déconnexion' }
    }
  }

  // Récupérer l'utilisateur actuel
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        return { user: null, error: authError?.message || 'Utilisateur non connecté' }
      }

      // Récupérer le profil utilisateur depuis user_profiles (SANS JOIN avec user_roles)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          email,
          phone_number,
          address,
          profile_image,
          role_id
        `)
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Erreur récupération profil:', profileError)
        // Retourner les données de base de l'utilisateur auth
        return { 
          user: {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || 'Utilisateur',
            role: authUser.user_metadata?.role || 'customer',
            phone_number: authUser.user_metadata?.phone_number,
            address: authUser.user_metadata?.address,
            profile_image: authUser.user_metadata?.profile_image
          }, 
          error: null 
        }
      }

      if (!profile) {
        return { user: null, error: 'Profil utilisateur non trouvé' }
      }

      // Déterminer le rôle basé sur role_id
      const role = profile.role_id === 2 ? 'partner' : 'customer'

      return { 
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: role,
          phone_number: profile.phone_number,
          address: profile.address,
          profile_image: profile.profile_image
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      return { user: null, error: 'Erreur lors de la récupération de l\'utilisateur' }
    }
  }

  // Mettre à jour le profil utilisateur
  static async updateProfile(userId: string, updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { user: null, error: error.message }
      }

      return { user: profile, error: null }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      return { user: null, error: 'Erreur lors de la mise à jour du profil' }
    }
  }

  // Écouter les changements d'authentification
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select(`
            id,
            name,
            email,
            phone_number,
            address,
            profile_image,
            role_id
          `)
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          const role = profile.role_id === 2 ? 'partner' : 'customer'
          callback({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: role,
            phone_number: profile.phone_number,
            address: profile.address,
            profile_image: profile.profile_image
          })
        } else {
          // Fallback vers les données de session
          callback({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Utilisateur',
            role: session.user.user_metadata?.role || 'customer',
            phone_number: session.user.user_metadata?.phone_number,
            address: session.user.user_metadata?.address,
            profile_image: session.user.user_metadata?.profile_image
          })
        }
      } else if (event === 'SIGNED_OUT') {
        callback(null)
      }
    })
  }
} 