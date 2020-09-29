import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

// const config = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASE_URL,
//   projectId: process.env.REACT_APP_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
// };

const config = {
  apiKey: 'AIzaSyDl_Mionn-j0hp8f4hriSZqvOI9q754zCA',
  authDomain: 'taddle-new-harmony-cafe.firebaseapp.com',
  databaseURL: 'https://taddle-new-harmony-cafe.firebaseio.com',
  projectId: 'taddle-new-harmony-cafe',
  storageBucket: 'taddle-new-harmony-cafe.appspot.com',
  messagingSenderId: '183816749191',
  appId: '1:183816749191:web:8677931d232f454a767822',
  measurementId: 'G-EG3DEKSHRE',
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    /* Helper */

    this.serverValue = app.database.ServerValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;

    /* Firebase APIs */

    this.auth = app.auth();
    this.db = app.database();

    /* Social Sign In Method Provider */

    this.googleProvider = new app.auth.GoogleAuthProvider();
    this.facebookProvider = new app.auth.FacebookAuthProvider();
    this.twitterProvider = new app.auth.TwitterAuthProvider();
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider);

  doSignInWithFacebook = () =>
    this.auth.signInWithPopup(this.facebookProvider);

  doSignInWithTwitter = () =>
    this.auth.signInWithPopup(this.twitterProvider);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = (email) =>
    this.auth.sendPasswordResetEmail(email);

  doSendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
      url:
        process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT ||
        'http://localhost:19006/',
    });
  doPasswordUpdate = (password) =>
    this.auth.currentUser.updatePassword(password);

  // *** Merge Auth and DB User API *** //

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.user(authUser.uid)
          .once('value')
          .then((snapshot) => {
            const dbUser = snapshot.val();

            // default empty roles
            if (!dbUser.roles) {
              dbUser.roles = {};
            }

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
            };

            next(authUser);
          });
      } else {
        fallback();
      }
    });

  // *** User API ***

  user = (uid) => this.db.ref(`users/${uid}`);

  users = () => this.db.ref('users');

  // *** Report API ***

  report = (uid) => this.db.ref(`reports/${uid}`);

  reports = () => this.db.ref('reports');

  // **** Building API ***

  building = (uid) => this.db.ref(`buildings/${uid}`);

  buildings = () => this.db.ref('buildings');

  // **** Floors API ***

  floor = (buildingId, uid) =>
    this.db.ref(`buildings/${buildingId}/floors/${uid}`);

  floors = (buildingId) =>
    this.db.ref(`buildings/${buildingId}/floors`);

  // floor = (uid) => this.db.ref(`floors/${uid}`);

  // floors = () => this.db.ref('floors');
}

export default Firebase;
