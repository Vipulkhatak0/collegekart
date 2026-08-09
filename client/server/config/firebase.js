import admin from 'firebase-admin';
import serviceAccount from '../config/firebase-service-account.json' assert { type: 'json' }; // or load via fs / env vars

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;