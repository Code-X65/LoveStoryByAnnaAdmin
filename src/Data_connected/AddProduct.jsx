import React, { useState, useEffect } from 'react';
import { Upload, X, Save, ShoppingCart, Eye, Heart, Minus, Plus, Truck, RotateCcw, Star, Share2 } from 'lucide-react';
import { useLocation, useNavigate,  } from 'react-router-dom';

import { addProduct, updateProduct } from '../Firebase/productServices';


const AddProduct = () => {
 const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    sku: '',
    price: '',
    originalPrice: '',
    category: '',
    collection: '',
    subcategory: '',
    variants: '',
    reviews: 0,
    rating: 5,
    stock: 0,
    description: '',
    material: '',
    pattern: '',
    care: '',
    fit: '',
    sizes: [],
    colors: [],
    image1: '',
    image2: '',
    image3: '',
    image4: '',
    image5: ''
  });
  const location = useLocation();
const navigate = useNavigate();
const [isEditing, setIsEditing] = useState(false);
const [editProductId, setEditProductId] = useState(null);

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([null, null, null, null, null]);
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const categories = ['GIRLS', 'BOYS', 'BABY', 'NEW ARRIVALS', 'ACCESSORIES', 'FOOTWEAR'];
  
  const collectionsMap = {
    'GIRLS': ['TWO-PIECE SETS', 'DRESSES', 'TOPS', 'BOTTOMS', 'FOOTWEAR', 'OTHERS'],
    'BOYS': ['TWO-PIECE SETS', 'TOPS', 'BOTTOMS', 'FOOTWEAR', 'OTHERS'],
    'BABY': ['BABY GIRL', 'BABY BOY', 'FOOTWEAR'],
    'NEW ARRIVALS': ['LATEST COLLECTION', 'BEST SELLERS'],
    'ACCESSORIES': ['HAIR ACCESSORIES', 'FASHION ACCESSORIES'],
    'FOOTWEAR': ['BABY SHOES', 'KIDS SHOES']
  };

  const subcategoriesMap = {
    'TWO-PIECE SETS': ['CORD SETS', 'MATCHING TOP & BOTTOM'],
    'DRESSES': ['CASUAL DRESSES', 'SPECIAL OCCASION DRESSES'],
    'TOPS': ['T-SHIRTS', 'BLOUSES', 'JACKETS', 'SHIRTS'],
    'BOTTOMS': ['SHORTS', 'JEANS', 'TROUSERS'],
    'BABY GIRL': ['TWO-PIECE SETS', 'DRESSES'],
    'BABY BOY': ['TWO-PIECE SETS']
  };

const sizeOptions = ['0-6 MTH', '6-12 MTH', '1-2 YEARS', '2-4 YEARS', '4-6 YEARS', '6-8 YEARS', '8-10 YEARS', '10-12 YEARS'];
  
  const colorOptions = ['Pink', 'Purple', 'Blue', 'Red', 'Yellow', 'Green', 'White', 'Black', 'Multi-Color'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'category' && { collection: '', subcategory: '' })
    }));
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleImageUpload = async (e, imageNumber) => {
  const file = e.target.files[0];
  if (file) {
    try {
      // Compress the image
      const compressedBase64 = await compressImage(file, 800, 0.7);
      
      const newPreviews = [...imagePreviews];
      newPreviews[imageNumber - 1] = compressedBase64;
      setImagePreviews(newPreviews);
      setFormData(prev => ({ ...prev, [`image${imageNumber}`]: compressedBase64 }));
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Failed to compress image. Please try again.');
    }
  }
};

  const removeImage = (imageNumber) => {
    const newPreviews = [...imagePreviews];
    newPreviews[imageNumber - 1] = null;
    setImagePreviews(newPreviews);
    setFormData(prev => ({ ...prev, [`image${imageNumber}`]: '' }));
  };

  const calculateDiscount = () => {
    if (formData.price && formData.originalPrice) {
      const price = parseFloat(formData.price);
      const original = parseFloat(formData.originalPrice);
      if (original > price) {
        return Math.round(((original - price) / original) * 100);
      }
    }
    return 0;
  };



const handleSubmit = async () => {
  // Validation
  if (!formData.name || !formData.price || !formData.category || !formData.collection || selectedSizes.length === 0 || selectedColors.length === 0) {
    alert('Please fill in all required fields');
    return;
  }

  setIsUploading(true);
  setUploadProgress('Preparing product data...');

  try {
    // Prepare images array
    const images = [];
    
    // Use existing images or new ones
    for (let i = 1; i <= 5; i++) {
      if (formData[`image${i}`]) {
        images.push(formData[`image${i}`]);
      } else if (imagePreviews[i - 1]) {
        images.push(imagePreviews[i - 1]);
      }
    }

    if (images.length === 0) {
      alert('Please upload at least one image');
      setIsUploading(false);
      setUploadProgress('');
      return;
    }

    // Prepare product data
    const productData = {
      name: formData.name,
      brand: formData.brand,
      model: formData.model,
      sku: formData.sku,
      price: parseInt(formData.price),
      originalPrice: parseInt(formData.originalPrice) || parseInt(formData.price),
      discount: calculateDiscount(),
      category: formData.category,
      collection: formData.collection,
      subcategory: formData.subcategory,
      variants: `${selectedColors.length} colors`,
      reviews: formData.reviews,
      rating: formData.rating,
      stock: parseInt(formData.stock) || 0,
      description: formData.description,
      material: formData.material,
      pattern: formData.pattern,
      care: formData.care,
      fit: formData.fit,
      sizes: selectedSizes,
      colors: selectedColors,
      images: images
    };

    setUploadProgress(isEditing ? 'Updating product...' : 'Saving product...');

    let result;
    if (isEditing) {
      result = await updateProduct(editProductId, productData);
      alert('Product updated successfully!');
    } else {
      result = await addProduct(productData);
      alert('Product added successfully!');
    }

    console.log('Product saved successfully:', result);

    // Navigate back to products listing
    navigate('/products');

  } catch (error) {
    console.error('Error saving product:', error);
    alert(`Failed to ${isEditing ? 'update' : 'add'} product. Please try again.`);
  } finally {
    setIsUploading(false);
    setUploadProgress('');
  }
};

  // Preview Component
  const ProductPreview = () => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [previewSize, setPreviewSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const availableImages = imagePreviews.filter(img => img !== null);
    const discount = calculateDiscount();

    return (
      <div className="fixed inset-0 bg-black/[0.8] bg-opacity-75 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 py-6">
          <div className="max-w-7xl mx-auto bg-white">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-semibold text-gray-900">Product Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Product Details */}
            <div className="px-6 py-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Images */}
                <div>
                  {/* Main Image */}
                  <div className="bg-gray-50 border border-gray-200 mb-4">
                    {availableImages.length > 0 ? (
                      <img
                        src={availableImages[selectedImage] || availableImages[0]}
                        alt={formData.name}
                        className="w-full h-auto object-contain"
                      />
                    ) : (
                      <div className="w-full h-96 flex items-center justify-center text-gray-400">
                        No images uploaded
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {availableImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {availableImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`border-2 transition-all ${
                            selectedImage === index
                              ? 'border-pink-300'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`View ${index + 1}`}
                            className="w-full h-auto object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Product Description */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {formData.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Key Features Table */}
                  {(formData.material || formData.pattern || formData.care || formData.fit) && (
                    <div className="mt-6">
                      <div className="bg-pink-300 text-white px-4 py-2 font-semibold text-sm">
                        Key Features
                      </div>
                      <table className="w-full text-sm border-x border-b border-gray-200">
                        <tbody>
                          {formData.material && (
                            <tr className="border-b border-gray-200">
                              <td className="px-4 py-3 text-gray-600 bg-gray-50 w-1/3">Material</td>
                              <td className="px-4 py-3 text-gray-900">{formData.material}</td>
                            </tr>
                          )}
                          {formData.pattern && (
                            <tr className="border-b border-gray-200">
                              <td className="px-4 py-3 text-gray-600 bg-gray-50 w-1/3">Pattern</td>
                              <td className="px-4 py-3 text-gray-900">{formData.pattern}</td>
                            </tr>
                          )}
                          {formData.care && (
                            <tr className="border-b border-gray-200">
                              <td className="px-4 py-3 text-gray-600 bg-gray-50 w-1/3">Care</td>
                              <td className="px-4 py-3 text-gray-900">{formData.care}</td>
                            </tr>
                          )}
                          {formData.fit && (
                            <tr>
                              <td className="px-4 py-3 text-gray-600 bg-gray-50 w-1/3">Fit</td>
                              <td className="px-4 py-3 text-gray-900">{formData.fit}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right Column - Product Details */}
                <div className="space-y-6">
                  {/* Title and Brand */}
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                      {formData.name || 'Product Name'}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>Brand: <span className="text-pink-300 font-medium">{formData.brand || 'N/A'}</span></span>
                      <span className="text-gray-300">|</span>
                      <span>Model: <span className="font-medium text-gray-900">{formData.model || 'N/A'}</span></span>
                    </div>

                    {/* Rating and Stock */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < (formData.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">(Reviews: {formData.reviews || 0})</span>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 font-medium">
                        In Stock
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-gray-50 p-4 border border-gray-200">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-gray-900">
                        ₦{parseInt(formData.price || 0).toLocaleString()}
                      </span>
                      {formData.originalPrice && (
                        <>
                          <span className="text-lg text-gray-400 line-through">
                            ₦{parseInt(formData.originalPrice).toLocaleString()}
                          </span>
                          {discount > 0 && (
                            <span className="bg-green-500 text-white text-sm px-2 py-1 font-medium">
                              Save {discount}%
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Available Colors */}
                  {selectedColors.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-3">
                        Available Colors:
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {selectedColors.map((color) => (
                          <button
                            key={color}
                            className="px-4 py-2 border-2 border-gray-300 text-sm text-gray-700 hover:border-pink-300 transition-all"
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {selectedSizes.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-3">
                        Sizes:
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {selectedSizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setPreviewSize(size)}
                            className={`py-2.5 text-sm font-medium border-2 transition-all ${
                              previewSize === size
                                ? 'border-pink-300 bg-pink-50 text-pink-400'
                                : 'border-gray-300 text-gray-700 hover:border-pink-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stock Info */}
                  <div className="text-sm">
                    <span className="text-gray-600">Available: </span>
                    <span className="font-semibold text-gray-900">{formData.stock || 0} units</span>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="space-y-4">
                    {/* Quantity */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={16} className="text-gray-700" />
                        </button>
                        <input
                          type="text"
                          value={quantity}
                          readOnly
                          className="w-16 text-center border-x border-gray-300 py-3 text-sm font-semibold"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={16} className="text-gray-700" />
                        </button>
                      </div>

                      <button
                        className="flex-1 py-3 bg-pink-300 text-white hover:bg-pink-400 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>
                    </div>

                    {/* Wishlist and Share */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={`flex-1 py-3 border-2 font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                          isWishlisted
                            ? 'border-pink-300 bg-pink-50 text-pink-400'
                            : 'border-gray-300 text-gray-700 hover:border-pink-300'
                        }`}
                      >
                        <Heart size={18} className={isWishlisted ? 'fill-pink-400' : ''} />
                      </button>
                      <button className="flex-1 py-3 border-2 border-gray-300 font-medium text-sm text-gray-700 hover:border-pink-300 transition-all flex items-center justify-center gap-2">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Warranty */}
                  <div className="bg-green-50 border border-green-200 px-4 py-3">
                    <p className="text-sm text-green-700">
                      ✓ Warranty: No warranty
                    </p>
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-3 border-t border-gray-200 pt-6">
                    <div className="flex gap-4">
                      <Truck className="text-gray-600 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-sm text-gray-900">Free Delivery</p>
                        <p className="text-sm text-gray-600">Enter your postal code for delivery availability</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <RotateCcw className="text-gray-600 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-sm text-gray-900">Return Delivery</p>
                        <p className="text-sm text-gray-600">Free 30 days delivery returns. Details</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

useEffect(() => {
  if (location.state?.product && location.state?.isEditing) {
    const product = location.state.product;
    setIsEditing(true);
    setEditProductId(product.id);
    
    // Populate form with existing data
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      model: product.model || '',
      sku: product.sku || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      category: product.category || '',
      collection: product.collection || '',
      subcategory: product.subcategory || '',
      variants: product.variants || '',
      reviews: product.reviews || 0,
      rating: product.rating || 5,
      stock: product.stock || 0,
      description: product.description || '',
      material: product.material || '',
      pattern: product.pattern || '',
      care: product.care || '',
      fit: product.fit || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      image1: '',
      image2: '',
      image3: '',
      image4: '',
      image5: ''
    });
    
    setSelectedSizes(product.sizes || []);
    setSelectedColors(product.colors || []);
    
    // Set existing images
    if (product.images && Array.isArray(product.images)) {
      const newPreviews = [null, null, null, null, null];
      product.images.forEach((img, index) => {
        if (index < 5) {
          newPreviews[index] = img;
        }
      });
      setImagePreviews(newPreviews);
    }
  }
}, [location.state]);

return (
    <div className="bg-gray-900 min-h-screen">
      {showPreview && <ProductPreview />}

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-300 mx-auto mb-4"></div>
            <p className="text-gray-900 font-semibold">{uploadProgress}</p>
          </div>
        </div>
      )}

      <div className="max-w-8xl mx-auto px-4 py-6">
        <div className="mb-6">
         <h1 className="text-2xl lg:text-3xl font-semibold text-white">
  {isEditing ? 'Edit Product' : 'Add New Product'}
</h1>
<p className="text-sm text-gray-400 mt-2">
  {isEditing ? 'Update product details' : 'Create a new product for your kids clothing store'}
</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Product Images *</h2>
            
            {/* Main Image */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Primary Image</label>
              {imagePreviews[0] ? (
                <div className="relative bg-gray-800 border border-gray-700 w-full h-[400px]">
                  <img src={imagePreviews[0]} alt="Preview 1" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(1)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-gray-700 bg-gray-800 cursor-pointer hover:border-pink-300 hover:bg-gray-750 transition-all">
                  <Upload size={40} className="text-gray-500 mb-2" />
                  <span className="text-sm text-gray-400">Click to upload primary image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 1)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {[2, 3, 4, 5].map((num) => (
                <div key={num}>
                  {imagePreviews[num - 1] ? (
                    <div className="relative border-2 border-gray-700 h-[200px]">
                      <img src={imagePreviews[num - 1]} alt={`Preview ${num}`} className="w-full h-full  object-cover" />
                      <button
                        onClick={() => removeImage(num)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 bg-gray-800 cursor-pointer hover:border-pink-300 hover:bg-gray-750 transition-all">
                      <Upload size={20} className="text-gray-500 mb-1" />
                      <span className="text-xs text-gray-400">Image {num}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, num)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>

            {/* Available Colors */}
            <div className="pt-4">
              <h2 className="text-lg font-semibold text-white mb-3">Available Colors *</h2>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    className={`px-4 py-2 border-2 text-sm font-medium transition-all ${
                      selectedColors.includes(color)
                        ? 'border-pink-300 bg-pink-900 text-pink-300'
                        : 'border-gray-600 text-gray-300 bg-gray-800 hover:border-pink-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Age Range *</h2>
              <div className="grid grid-cols-4 gap-3">
                {sizeOptions.map(size => (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`py-2.5 text-sm font-medium border-2 transition-all ${
                      selectedSizes.includes(size)
                        ? 'border-pink-300 bg-pink-900 text-pink-300'
                        : 'border-gray-600 text-gray-300 bg-gray-800 hover:border-pink-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
                placeholder="6"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Product Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
                placeholder="The Boys Blue Ankara Short Sleeve Shirt features premium quality fabric..."
              />
            </div>

            {/* Key Features */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Key Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Material</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
                    placeholder="Premium Cotton Blend"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pattern</label>
                  <input
                    type="text"
                    name="pattern"
                    value={formData.pattern}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
                    placeholder="Authentic Ankara Print"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Care</label>
                  <input
                    type="text"
                    name="care"
                    value={formData.care}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
                    placeholder="Machine Washable"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fit</label>
                  <input
                    type="text"
                    name="fit"
                    value={formData.fit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
                    placeholder="Comfortable Regular Fit"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
                    placeholder="BOYS BLUE ANKARA SHORT SLEEVE SHIRT"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
                      placeholder="ANKARA KIDS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
                      placeholder="Latest AKS"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
                    placeholder="LSSCBDLNCR_18 MTH"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Pricing</h2>
              <div className="bg-gray-800 p-4 border border-gray-700">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price (₦) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-700 bg-gray-900 text-white text-sm focus:outline-none focus:border-pink-300"
                      placeholder="37950"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Original Price (₦)</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-700 bg-gray-900 text-white text-sm focus:outline-none focus:border-pink-300"
                      placeholder="45000"
                    />
                  </div>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="bg-green-500 text-white text-sm px-2 py-1 font-medium inline-block">
                    Save {calculateDiscount()}%
                  </div>
                )}
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Category & Collection</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Collection *</label>
                  <select
                    name="collection"
                    value={formData.collection}
                    onChange={handleInputChange}
                    disabled={!formData.category}
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300 disabled:bg-gray-900 disabled:text-gray-600"
                  >
                    <option value="">Select collection</option>
                    {formData.category && collectionsMap[formData.category]?.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subcategory</label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    disabled={!formData.collection}
                    className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300 disabled:bg-gray-900 disabled:text-gray-600"
                  >
                    <option value="">Select subcategory</option>
                    {formData.collection && subcategoriesMap[formData.collection]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => setShowPreview(true)}
                className="w-full py-3 bg-gray-700 text-white font-semibold text-sm transition-all hover:bg-gray-600 flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                Preview Product
              </button>
              
              <div className="flex gap-3">
                <button
  onClick={handleSubmit}
  className="flex-1 py-3 bg-pink-300 text-white font-semibold text-sm transition-all hover:bg-pink-400 flex items-center justify-center gap-2"
>
  <Save size={18} />
  {isEditing ? 'Update Product' : 'Add Product'}
</button>
              <button
  onClick={() => navigate('/products')}
  className="flex-1 py-3 border-2 border-gray-600 font-semibold text-sm text-gray-300 hover:border-pink-300 transition-all"
>
  Cancel
</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  export default AddProduct