const admin = require('firebase-admin');
const data = require('./firebase-seed.json');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importData() {
  for (const [collection, docs] of Object.entries(data)) {
    for (const [docId, docData] of Object.entries(docs)) {
      await db.collection(collection).doc(docId).set(docData);
      console.log(`✅ Imported ${collection}/${docId}`);
    }
  }
  console.log('🎉 All data imported!');
}

importData();
