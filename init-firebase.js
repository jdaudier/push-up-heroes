import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "apiKey": process.env.firebaseApiKey,
  "authDomain": "push-up-heroes-6a002.firebaseapp.com",
  "databaseURL": "https://push-up-heroes-6a002.firebaseio.com",
  "projectId": "push-up-heroes-6a002",
  "storageBucket": "push-up-heroes-6a002.appspot.com",
  "messagingSenderId": "429024520916",
  "appId": "1:429024520916:web:4bdc6271f3006c87d3a941",
  "measurementId": "G-7QFX10Q1KM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
