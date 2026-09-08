import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { AuthUser, CartItem, SellerIntake, BuyerOrder } from '../types';
import { saveStoredAuthUser, clearStoredAuthUser } from './storage';

// ----------------------------------------------------
// 1. USER ACCOUNTS (Brand Partner vs Direct Customer)
// ----------------------------------------------------

export interface StoredUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'SELLER';
  bpId?: string;
  street?: string;
  city?: string;
  pin?: string;
  provider?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Save or update user profile in Firestore collection /users/{userId}
 */
export async function saveUserProfileToFirestore(user: AuthUser): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    const payload: StoredUserProfile = {
      id: user.id,
      name: user.name,
      email: user.email.toLowerCase(),
      phone: user.phone || '',
      role: user.role, // 'CUSTOMER' or 'SELLER'
      bpId: user.bpId || '',
      street: user.street || '',
      city: user.city || 'Kolkata',
      pin: user.pin || '700077',
      provider: user.provider || 'password',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(userRef, payload, { merge: true });
  } catch (error) {
    console.warn("Could not write user profile to Firestore (using local session):", error);
  }
}

/**
 * Fetch a user profile from Firestore by user ID
 */
export async function getUserProfileFromFirestore(userId: string): Promise<AuthUser | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as StoredUserProfile;
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        bpId: data.bpId,
        street: data.street,
        city: data.city || 'Kolkata',
        pin: data.pin || '700077',
        provider: data.provider
      };
    }
  } catch (error) {
    console.warn("Could not read user profile from Firestore:", error);
  }
  return null;
}

/**
 * Fetch all registered users (for admin service dashboard)
 */
export async function getAllUsersFromFirestore(): Promise<StoredUserProfile[]> {
  try {
    const colRef = collection(db, 'users');
    const snapshot = await getDocs(colRef);
    const users: StoredUserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as StoredUserProfile);
    });
    return users;
  } catch (error) {
    console.warn("Could not read users list from Firestore:", error);
    return [];
  }
}

// ----------------------------------------------------
// 2. ORDERS & INQUIRIES (Saved for Future Service)
// ----------------------------------------------------

export interface StoredOrderRecord {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerRole: 'CUSTOMER' | 'SELLER';
  bpConsultantId?: string;
  items: {
    sku: string;
    title: string;
    clearancePrice: number;
    quantity: number;
    subtotal: number;
  }[];
  totalAmount: number;
  totalSavings: number;
  dispatchMethod: string;
  deliveryAddress: string;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED';
  createdAt: string;
}

/**
 * Save an order to Firestore so Biswajit Roy / Team Golden Star
 * has complete records for future support, dispatch & claims.
 */
export async function saveOrderToFirestore(
  orderId: string,
  user: AuthUser | null,
  customerName: string,
  customerPhone: string,
  address: string,
  dispatchMethod: string,
  cartItems: CartItem[],
  totalAmount: number,
  notes?: string
): Promise<StoredOrderRecord> {
  const orderRecord: StoredOrderRecord = {
    id: orderId,
    userId: user?.id || 'guest',
    customerName: customerName.trim() || user?.name || 'Valued Customer',
    customerPhone: customerPhone.trim() || user?.phone || '7003146399',
    customerRole: user?.role || 'CUSTOMER',
    bpConsultantId: user?.bpId || '',
    items: cartItems.map(item => ({
      sku: item.product.sku,
      title: item.product.title,
      clearancePrice: item.product.clearancePrice,
      quantity: item.quantity,
      subtotal: item.product.clearancePrice * item.quantity
    })),
    totalAmount: totalAmount,
    totalSavings: cartItems.reduce((acc, item) => acc + ((item.product.mrp - item.product.clearancePrice) * item.quantity), 0),
    dispatchMethod: dispatchMethod || 'Express SPO Dumdum Central Node',
    deliveryAddress: address || 'Kolkata Dumdum SPO',
    notes: notes || '',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  try {
    const orderRef = doc(db, 'orders', orderId);
    await setDoc(orderRef, orderRecord);
    console.log("Order saved to Firestore successfully:", orderId);
  } catch (error) {
    console.warn("Could not save order to Firestore (storing locally):", error);
  }

  return orderRecord;
}

/**
 * Retrieve all saved orders for a specific user (for their claims/service dashboard)
 */
export async function getOrdersForUserFromFirestore(userId: string): Promise<StoredOrderRecord[]> {
  try {
    const colRef = collection(db, 'orders');
    const q = query(colRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const orders: StoredOrderRecord[] = [];
    snapshot.forEach((doc) => {
      orders.push(doc.data() as StoredOrderRecord);
    });
    return orders;
  } catch (error) {
    console.warn("Could not read user orders from Firestore:", error);
    return [];
  }
}

/**
 * Retrieve all saved orders across the platform (for Admin Service Console)
 */
export async function getAllOrdersFromFirestore(): Promise<StoredOrderRecord[]> {
  try {
    const colRef = collection(db, 'orders');
    const snapshot = await getDocs(colRef);
    const orders: StoredOrderRecord[] = [];
    snapshot.forEach((doc) => {
      orders.push(doc.data() as StoredOrderRecord);
    });
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn("Could not read orders from Firestore:", error);
    return [];
  }
}

// ----------------------------------------------------
// 3. SELLER INTAKES (Brand Partner Stock Liquidation)
// ----------------------------------------------------

/**
 * Save a Seller Intake directly to Firestore
 */
export async function saveIntakeToFirestore(intake: SellerIntake): Promise<void> {
  try {
    const intakeRef = doc(db, 'intakes', intake.id);
    await setDoc(intakeRef, {
      ...intake,
      updatedAt: new Date().toISOString()
    });
    console.log("Seller intake saved to Firestore:", intake.id);
  } catch (error) {
    console.warn("Could not save intake to Firestore:", error);
  }
}

/**
 * Fetch all seller intakes from Firestore
 */
export async function getAllIntakesFromFirestore(): Promise<SellerIntake[]> {
  try {
    const colRef = collection(db, 'intakes');
    const snapshot = await getDocs(colRef);
    const intakes: SellerIntake[] = [];
    snapshot.forEach((doc) => {
      intakes.push(doc.data() as SellerIntake);
    });
    return intakes;
  } catch (error) {
    console.warn("Could not read intakes from Firestore:", error);
    return [];
  }
}
