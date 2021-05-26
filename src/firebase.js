import firebase from "firebase/app";

import "firebase/database";
// import * as firebase from "firebase";
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCuyCXa7IMPKRhzcUGu6Ek6D4rzGxsA9mo",
  authDomain: "chattypie-eeb6e.firebaseapp.com",
  projectId: "chattypie-eeb6e",
  storageBucket: "chattypie-eeb6e.appspot.com",
  messagingSenderId: "495806413802",
  appId: "1:495806413802:web:9333e141fdbe1c556d1093",
};
// Initialize Firebase
const db = firebase.initializeApp(firebaseConfig);

export default db.database().ref()
