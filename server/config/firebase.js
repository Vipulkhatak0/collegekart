import admin from 'firebase-admin';

console.log('firebase-admin import type:', typeof admin);
console.log('firebase-admin keys:', admin ? Object.keys(admin) : 'admin is falsy');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;