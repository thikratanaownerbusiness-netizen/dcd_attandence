import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Enable persistence so the login persists across refreshes
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Failed to set persistence:", err);
});

// Configure Google OAuth Provider
const provider = new GoogleAuthProvider();
// Add required scopes
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) return null;
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || '';
    cachedAccessToken = accessToken;
    return { user: result.user, accessToken };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null, token: string | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedAccessToken = null;
    }
    callback(user, cachedAccessToken);
  });
};

export const getCachedToken = () => cachedAccessToken;
