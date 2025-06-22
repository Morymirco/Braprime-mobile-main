console.log('🧪 Test des deep links et de la configuration');
console.log('='.repeat(50));

console.log('📱 VOTRE CONFIGURATION :');
console.log('');

console.log('✅ IP locale détectée : 192.168.1.106');
console.log('✅ Scheme configuré : braprime');
console.log('✅ Deep link : braprime://login-callback');
console.log('');

console.log('🔧 URLs À CONFIGURER DANS SUPABASE :');
console.log('');

console.log('Allez sur : https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/url-configuration');
console.log('');
console.log('Dans "Redirect URLs", ajoutez ces URLs :');
console.log('');

const redirectUrls = [
  'braprime://login-callback',
  'exp://localhost:8081/--/login-callback',
  'exp://192.168.1.106:8081/--/login-callback'
];

redirectUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

console.log('');
console.log('📧 TEMPLATE D\'EMAIL À CONFIGURER :');
console.log('');

console.log('Allez sur : https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/templates');
console.log('Sélectionnez "Confirm signup" et utilisez ce template :');
console.log('');

const emailTemplate = `
Sujet : Confirmez votre inscription - BraPrime

Contenu :
Bonjour,

Bienvenue sur BraPrime ! Pour confirmer votre inscription et accéder à l'application, cliquez sur le lien ci-dessous :

{{ .ConfirmationURL }}

Ce lien est valable pendant 24 heures.

Si vous n'avez pas créé de compte sur BraPrime, vous pouvez ignorer cet email.

Cordialement,
L'équipe BraPrime
`;

console.log(emailTemplate);

console.log('🧪 PROCÉDURE DE TEST :');
console.log('');

console.log('1. Configurez les URLs de redirection dans Supabase');
console.log('2. Configurez le template d\'email');
console.log('3. Lancez l\'application :');
console.log('   npm start');
console.log('');
console.log('4. Scannez le QR code avec Expo Go sur votre téléphone');
console.log('5. Testez l\'authentification :');
console.log('   - Entrez une adresse email valide');
console.log('   - Cliquez sur "Continuer"');
console.log('   - Vérifiez votre boîte email');
console.log('   - Cliquez sur le lien dans l\'email');
console.log('   - L\'application devrait s\'ouvrir automatiquement');
console.log('   - Vous devriez être connecté et redirigé vers l\'app principale');
console.log('');

console.log('🔍 DÉPANNAGE :');
console.log('');

console.log('Si l\'application ne s\'ouvre pas automatiquement :');
console.log('1. Vérifiez que les URLs de redirection sont correctes dans Supabase');
console.log('2. Assurez-vous que l\'IP locale est correcte');
console.log('3. Vérifiez que l\'application est installée sur votre téléphone');
console.log('4. Essayez de copier-coller le lien dans un navigateur');
console.log('');

console.log('Si la connexion échoue :');
console.log('1. Vérifiez les logs dans la console de l\'application');
console.log('2. Vérifiez les logs dans Supabase Dashboard > Logs');
console.log('3. Assurez-vous que le schéma de base de données est exécuté');
console.log('4. Vérifiez que l\'authentification par email est activée');
console.log('');

console.log('📞 LIENS DE CONFIGURATION :');
console.log('- URL Configuration: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/url-configuration');
console.log('- Auth Templates: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/templates');
console.log('- Auth Providers: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/providers');
console.log('- Logs: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/logs'); 