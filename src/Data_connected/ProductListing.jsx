import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { getAllProducts, deleteProduct, toggleProductStatus } from '../Firebase/productServices';

const ProductListing = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null, productName: '' });

  const categories = ['ALL', 'GIRLS', 'BOYS', 'BABY', 'NEW ARRIVALS', 'ACCESSORIES', 'FOOTWEAR'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'ALL') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteModal.productId);
      setProducts(products.filter(p => p.id !== deleteModal.productId));
      setDeleteModal({ show: false, productId: null, productName: '' });
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      await toggleProductStatus(productId, !currentStatus);
      setProducts(products.map(p =>
        p.id === productId ? { ...p, isActive: !currentStatus } : p
      ));
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Failed to update product status');
    }
  };

  const handleEdit = (product) => {
    navigate('/add-product', { state: { product, isEditing: true } });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-500', textColor: 'text-red-500' };
    } else if (stock <= 5) {
      return { label: 'Low Stock', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    } else {
      return { label: 'In Stock', color: 'bg-green-500', textColor: 'text-green-500' };
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-300 mx-auto mb-4"></div>
          <p className="text-white">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center px-4">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "<span className="font-semibold text-pink-300">{deleteModal.productName}</span>"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteModal({ show: false, productId: null, productName: '' })}
                className="flex-1 py-2 border-2 border-gray-600 text-gray-300 font-semibold hover:border-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-white">Products</h1>
            <p className="text-sm text-gray-400 mt-2">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={() => navigate('/add-product')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-pink-300 text-white font-semibold hover:bg-pink-400 transition-colors"
          >
            <Plus size={20} />
            Add New Product
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 grid lg:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, brand, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-pink-300 appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'ALL' ? '' : cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No products found</p>
            <button
              onClick={() => navigate('/add-product')}
              className="mt-4 px-6 py-3 bg-pink-300 text-white font-semibold hover:bg-pink-400 transition-colors"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-gray-800 border border-gray-700 overflow-hidden group">
                <div className="relative bg-gray-700 h-48 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2">
                    <button
                      onClick={() => handleToggleStatus(product.id, product.isActive)}
                      className={`px-2 py-1 text-xs font-semibold ${
                        product.isActive
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                      -{product.discount}%
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span className="bg-gray-700 px-2 py-1">{product.category}</span>
                    {product.brand && <span>{product.brand}</span>}
                  </div>

                  <h3 className="text-sm font-semibold text-white  ">
                    {product.name}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-lg font-bold text-pink-300">
                      ₦{product.price?.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₦{product.originalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold ${getStockStatus(product.stock).color} text-white`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      {getStockStatus(product.stock).label}
                    </div>
                    <span className="ml-2 text-xs text-gray-400">
                      ({product.stock || 0} units)
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                    <span>{product.sizes?.length || 0} sizes</span>
                    <span>•</span>
                    <span>{product.colors?.length || 0} colors</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex items-center justify-center gap-1 py-2 border border-gray-600 text-gray-300 text-sm font-medium hover:border-pink-300 hover:text-pink-300 transition-colors"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, productId: product.id, productName: product.name })}
                      className="flex items-center justify-center gap-1 py-2 border border-gray-600 text-gray-300 text-sm font-medium hover:border-red-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;