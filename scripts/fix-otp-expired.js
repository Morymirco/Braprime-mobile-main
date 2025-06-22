console.log('🔧 Diagnostic et correction de l\'erreur "Email link is invalid or has expired"');
console.log('='.repeat(70));

console.log('❌ ERREUR DÉTECTÉE : Email link is invalid or has expired');
console.log('📧 Problème : Le lien d\'authentification a expiré ou la configuration est incorrecte');
console.log('');

console.log('🔍 CAUSES POSSIBLES :');
console.log('');

const causes = [
  {
    name: 'Lien expiré',
    description: 'Le lien a dépassé la durée de validité (24h par défaut)',
    solution: 'Demander un nouveau lien de connexion'
  },
  {
    name: 'URLs de redirection incorrectes',
    description: 'Les URLs de redirection ne sont pas configurées dans Supabase',
    solution: 'Configurer les URLs de redirection'
  },
  {
    name: 'Authentification par email désactivée',
    description: 'L\'authentification par email n\'est pas activée',
    solution: 'Activer Email Auth dans Supabase'
  },
  {
    name: 'Template d\'email incorrect',
    description: 'Le template d\'email ne contient pas le bon lien',
    solution: 'Vérifier le template d\'email'
  },
  {
    name: 'Deep links mal configurés',
    description: 'Les deep links ne sont pas correctement configurés',
    solution: 'Vérifier la configuration des deep links'
  }
];

causes.forEach((cause, index) => {
  console.log(`${index + 1}. ${cause.name}`);
  console.log(`   Description: ${cause.description}`);
  console.log(`   Solution: ${cause.solution}`);
  console.log('');
});

console.log('🔧 SOLUTIONS DÉTAILLÉES :');
console.log('');

console.log('1. 🎯 Vérifier la configuration Supabase :');
console.log('   a) Allez sur : https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/providers');
console.log('   b) Vérifiez que "Email Auth" est activé');
console.log('   c) Activez "Enable email confirmations"');
console.log('   d) Activez "Enable email change confirmations"');
console.log('');

console.log('2. 🔗 Configurer les URLs de redirection :');
console.log('   a) Allez sur : https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/url-configuration');
console.log('   b) Dans "Site URL", entrez : https://braprime.com (ou votre domaine)');
console.log('   c) Dans "Redirect URLs", ajoutez :');
console.log('');

const redirectUrls = [
  'braprime://login-callback',
  'exp://localhost:8081/--/login-callback',
  'exp://192.168.1.106:8081/--/login-callback',
  'http://localhost:8081/--/login-callback',
  'http://192.168.1.106:8081/--/login-callback'
];

redirectUrls.forEach((url, index) => {
  console.log(`      ${index + 1}. ${url}`);
});

console.log('');
console.log('3. 📧 Vérifier le template d\'email :');
console.log('   a) Allez sur : https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/templates');
console.log('   b) Sélectionnez "Confirm signup"');
console.log('   c) Vérifiez que le template contient : {{ .ConfirmationURL }}');
console.log('');

console.log('4. ⏰ Augmenter la durée de validité (optionnel) :');
console.log('   a) Dans Supabase Dashboard > Settings > Auth');
console.log('   b) Cherchez "JWT expiry" ou "Token expiry"');
console.log('   c) Augmentez la valeur (par défaut 3600 secondes = 1 heure)');
console.log('');

console.log('5. 🔄 Améliorer la gestion d\'erreur dans l\'application :');
console.log('');

const improvedErrorHandling = `
// Dans lib/contexts/AuthContext.tsx, améliorer la gestion d'erreur :

const signInWithEmail = async (email: string) => {
  setLoading(true);
  setError(null);
  setMagicLinkSent(false);
  
  try {
    console.log('🔐 Tentative de connexion avec l\'email:', email);
    
    const { error } = await supabase.auth.signInWithOtp({ 
      email: email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'braprime://login-callback'
      }
    });
    
    if (error) {
      console.error('❌ Erreur de connexion:', error);
      
      // Gestion spécifique des erreurs
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        setError('Le lien de connexion a expiré. Veuillez demander un nouveau lien.');
      } else {
        setError(error.message);
      }
      return { error };
    }
    
    console.log('✅ Magic link envoyé avec succès');
    setMagicLinkSent(true);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('❌ Exception lors de la connexion:', err);
    setError(errorMessage);
    return { error: { message: errorMessage } };
  } finally {
    setLoading(false);
  }
};
`;

console.log(improvedErrorHandling);

console.log('🧪 PROCÉDURE DE TEST :');
console.log('');

console.log('1. Configurez les URLs de redirection dans Supabase');
console.log('2. Vérifiez que l\'authentification par email est activée');
console.log('3. Testez avec un nouvel email (pas un lien expiré)');
console.log('4. Lancez l\'application : npm start');
console.log('5. Testez l\'authentification avec une nouvelle adresse email');
console.log('');

console.log('🔍 VÉRIFICATIONS À EFFECTUER :');
console.log('');

console.log('✅ Email Auth activé dans Supabase');
console.log('✅ URLs de redirection configurées');
console.log('✅ Template d\'email correct');
console.log('✅ Deep links configurés dans app.json');
console.log('✅ Écran login-callback créé');
console.log('✅ Gestion d\'erreur améliorée');
console.log('');

console.log('📞 LIENS DE CONFIGURATION :');
console.log('- Auth Providers: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/providers');
console.log('- URL Configuration: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/url-configuration');
console.log('- Auth Templates: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/templates');
console.log('- Auth Settings: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/settings');
console.log('- Logs: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/logs'); 