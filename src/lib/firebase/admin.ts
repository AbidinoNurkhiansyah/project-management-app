import * as admin from "firebase-admin";

export function initFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return admin.initializeApp();
}

export function getAdminAuth(): admin.auth.Auth {
  return initFirebaseAdmin().auth();
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return initFirebaseAdmin().firestore();
}
