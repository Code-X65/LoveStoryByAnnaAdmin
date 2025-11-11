import { 
  collection, 
  addDoc, 
  getDocs, 
  doc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Create new order
export const createOrder = async (userId, orderData) => {
  try {
    // Correct path - nested under user
    const ordersRef = collection(db, 'users', userId, 'orders');
    const docRef = await addDoc(ordersRef, {
      userId,
      ...orderData,
      createdAt: serverTimestamp(), // Use serverTimestamp
      updatedAt: serverTimestamp()
    });

    return { 
      success: true, 
      orderId: docRef.id
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Get all user orders
export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(db, 'users', userId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};
// Update order with OTP
export const updateOrderOtp = async (userId, orderId, otp) => {
  try {
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    await updateDoc(orderRef, {
      orderOtp: otp,
      otpGeneratedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating order OTP:', error);
    return { success: false, error: error.message };
  }
};

// Update order status
export const updateOrderStatus = async (userId, orderId, status) => {
  try {
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return { success: true, message: 'Order status updated' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update payment status
export const updatePaymentStatus = async (userId, orderId, paymentStatus, paymentReference) => {
  try {
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    await updateDoc(orderRef, {
      paymentStatus,
      paymentReference,
      updatedAt: serverTimestamp()
    });
    return { success: true, message: 'Payment status updated' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Add this NEW function to orderServices.js for ADMIN use
export const getAllOrders = async () => {
  try {
    console.log('getAllOrders: Starting...');
    const allOrders = [];
    
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log('getAllOrders: Found users:', usersSnapshot.docs.length);
    
    // For each user, get their orders
    for (const userDoc of usersSnapshot.docs) {
      console.log('getAllOrders: Checking user:', userDoc.id);
      const ordersRef = collection(db, 'users', userDoc.id, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const ordersSnapshot = await getDocs(q);
      
      console.log(`getAllOrders: User ${userDoc.id} has ${ordersSnapshot.docs.length} orders`);
      
      ordersSnapshot.forEach(orderDoc => {
        const orderData = {
          id: orderDoc.id,
          userId: userDoc.id,
          ...orderDoc.data()
        };
        console.log('getAllOrders: Adding order:', orderData);
        allOrders.push(orderData);
      });
    }
    
    console.log('getAllOrders: Total orders found:', allOrders.length);
    return allOrders;
  } catch (error) {
    console.error('getAllOrders: Error:', error);
    throw error;
  }
};

