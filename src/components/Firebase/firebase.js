import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';
import 'firebase/analytics';

const config = {
  apiKey: process.env.REACT_APP_API_KEY || 'AIzaSyBnJSs5VkOG4k2VAByyYU8pxeyOthF3FFs',
  authDomain: process.env.REACT_APP_AUTH_DOMAIN || 'minerva-facilities.firebaseapp.com',
  databaseURL: process.env.REACT_APP_DATABASE_URL || 'https://minerva-facilities.firebaseio.com',
  projectId: process.env.REACT_APP_PROJECT_ID || 'minerva-facilities',
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET || 'minerva-facilities.appspot.com',
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID || '286455586521',
  appId: process.env.REACT_APP_APP_ID || '1:286455586521:web:658ab0b3a18a1dcebfe8c8',
  measurementId: process.env.REACT_APP_MEASUREMENT_ID || 'G-674WMEGJDS',
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
    this.storage = app.storage();
    this.analytics = app.analytics();

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
              dbUser.roles = 'EMPLOYEE';
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
  setUserCompany = (userID, companyID) => this.user(userID).update({company_id: companyID});


  // *** Report API ***
  report = (uid) => this.db.ref(`reports/${uid}`);
  reports = () => this.db.ref('reports');


  // **** Company API ***
  company = (uid) => this.db.ref(`companies/${uid}`);
  companies = () => this.db.ref('companies');

  createCompany = (companyData) => {
    // Get a key for a new Company.
    var newCompanyKey = this.db.ref('companies').push().key;
    // Write the new company's data simultaneously in the compnay list and the user's companies list.
    var updates = {};
    updates['/companies/' + newCompanyKey] = companyData;
    updates['/users/' + companyData.owner.ownerID + '/company_id'] = newCompanyKey;

    updates[
      '/users/' + companyData.owner.ownerID + '/companies/' + companyData.companyTitle
    ] = newCompanyKey;

    this.db.ref().update(updates);

    return newCompanyKey;
  };


  // **** Building API ***
  building = (uid) => this.db.ref(`buildings/${uid}`);
  buildings = () => this.db.ref('buildings');


  // **** Floors API ***
  floor = (uid) => this.db.ref(`floors/${uid}`);
  floors = () => this.db.ref('floors');


  // *** Rooms API ***
  room = (uid) => this.db.ref(`rooms/${uid}`);
  rooms = () => this.db.ref('rooms');

}

export default Firebase;
