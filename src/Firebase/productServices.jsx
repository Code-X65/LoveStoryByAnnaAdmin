import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Convert image to base64
const convertImageToBase64 = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
};

// Process images and convert to base64
export const processImages = async (images) => {
  const processedImages = [];
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    let base64Data;
    
    // If it's already a base64 string, use it directly
    if (typeof image === 'string' && image.startsWith('data:')) {
      base64Data = image;
    } 
    // If it's a File object, convert it
    else if (image instanceof File) {
      base64Data = await convertImageToBase64(image);
    }
    // If it has a file property (your current format)
    else if (image.file) {
      base64Data = await convertImageToBase64(image.file);
    }
    // If it's already in the correct format with data property
    else if (image.data) {
      base64Data = image.data;
    }
    
    processedImages.push({
      data: base64Data,
      name: image.name || `image-${i + 1}`,
      isPrimary: i === 0,
      size: image.size || (image.file ? image.file.size : 0)
    });
  }
  
  return processedImages;
};

// Add new product
export const addProduct = async (productData) => {
  try {
    // Prepare product data
    const productToSave = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, 'products'), productToSave);
    
    return { id: docRef.id, ...productToSave };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Get all products
export const getAllProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (category) => {
  try {
    const q = query(collection(db, 'products'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    return products;
  } catch (error) {
    console.error('Error getting products by category:', error);
    throw error;
  }
};

// Get products by subcategory
export const getProductsBySubcategory = async (category, subcategory) => {
  try {
    const q = query(
      collection(db, 'products'),
      where('category', '==', category),
      where('subcategory', '==', subcategory)
    );
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    return products;
  } catch (error) {
    console.error('Error getting products by subcategory:', error);
    throw error;
  }
};

// Get single product by ID
export const getProductById = async (productId) => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() };
    } else {
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (productId, updatedData, newImages = null) => {
  try {
    let imagesToSave = updatedData.images;
    
    // If new images are provided, process them
    if (newImages && newImages.length > 0) {
      imagesToSave = await processImages(newImages);
    }
    
    const productToUpdate = {
      ...updatedData,
      images: imagesToSave,
      updatedAt: serverTimestamp()
    };
    
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, productToUpdate);
    
    return { id: productId, ...productToUpdate };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, 'products', productId));
    return productId;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Search products by name
export const searchProducts = async (searchTerm) => {
  try {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() };
      if (product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        products.push(product);
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Toggle product active status
export const toggleProductStatus = async (productId, isActive) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      isActive: isActive,
      updatedAt: serverTimestamp()
    });
    
    return { id: productId, isActive };
  } catch (error) {
    console.error('Error toggling product status:', error);
    throw error;
  }
};

// Update product stock
export const updateProductStock = async (productId, stockQuantity) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      stockQuantity: stockQuantity,
      inStock: stockQuantity > 0,
      updatedAt: serverTimestamp()
    });
    
    return { id: productId, stockQuantity };
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};