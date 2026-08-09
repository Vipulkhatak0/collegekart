import pkg from 'firebase-admin';
const { credential, initializeApp, apps } = pkg;

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!apps.length) {
  initializeApp({
    credential: credential.cert(serviceAccount),
  });
}

export default pkg;