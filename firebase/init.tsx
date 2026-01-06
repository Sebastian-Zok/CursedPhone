import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_DATABASEURL,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENTID,
}

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket
)

let firebaseApp: firebase.app.App | null = null

if (isFirebaseConfigured) {
  if (firebase.apps.length) {
    firebaseApp = firebase.apps[0]
  } else {
    firebaseApp = firebase.initializeApp(firebaseConfig)
  }
}

const firestore = firebaseApp ? firebaseApp.firestore() : (null as any)
const storage = firebaseApp ? firebaseApp.storage().ref() : (null as any)

const { FieldValue, Timestamp } = firebase.firestore

export { firestore, storage, FieldValue, Timestamp }
