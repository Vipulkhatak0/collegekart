import admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.getApps().length) {
  admin.initializeApp({
    credential: admin.cert(serviceAccount),
  });
}

export default admin;