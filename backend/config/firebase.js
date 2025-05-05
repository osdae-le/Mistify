const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'mistify-7d410'
});

const db = admin.firestore();
const auth = admin.auth();

(async () => {
  try {
    await db.collection('testConnection').add({
      message: 'Firebase Firestore connected successfully!',
      timestamp: new Date()
    });
    console.log('✅ Firestore connected successfully! Data written to testConnection.');
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
  }
})();

module.exports = { db, auth };
