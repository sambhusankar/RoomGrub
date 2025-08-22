const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

console.log('Generating VAPID keys for push notifications...\n');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Generated VAPID Keys:');
console.log('===================');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
console.log('\n');

// Create .env.local content
const envContent = `# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`;

// Write to .env.local file
const envPath = path.join(process.cwd(), '.env.local');
let existingEnv = '';

try {
  existingEnv = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  // File doesn't exist, will create new one
}

// Check if VAPID keys already exist in the file
if (existingEnv.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY') || existingEnv.includes('VAPID_PRIVATE_KEY')) {
  console.log('⚠️  VAPID keys already exist in .env.local file.');
  console.log('   Please manually replace them with the new keys above if needed.\n');
} else {
  // Append VAPID keys to existing .env.local content
  const newEnvContent = existingEnv ? existingEnv + '\n' + envContent : envContent;
  
  try {
    fs.writeFileSync(envPath, newEnvContent);
    console.log('✅ VAPID keys have been added to .env.local file');
  } catch (error) {
    console.error('❌ Error writing to .env.local file:', error.message);
    console.log('\nPlease manually add these lines to your .env.local file:');
    console.log(envContent);
  }
}

console.log('\nNext steps:');
console.log('1. Restart your development server to load the new environment variables');
console.log('2. Make sure your database has the required tables (push_subscriptions, notifications)');
console.log('3. Test push notifications by adding grocery or making payments');
console.log('\nImportant: Keep your private key secure and never commit it to version control!');