// components/Admin/ProductManagement.jsx
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image'; // For displaying product images
import { FiEdit, FiTrash, FiPlus, FiSave, FiX, FiUpload } from 'react-icons/fi'; // Icons for actions

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // For edit/add
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null); // For image upload

  const getProductImageUrl = (imagePath) => {
    const placeholder = "https://placehold.co/100x100/e0e0e0/555555?text=No+Image";
    return imagePath 
      ? (imagePath.startsWith('/') ? imagePath : `/images/${imagePath}`)
      : placeholder;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming /api/admin/products is an admin-protected endpoint
      const response = await axios.get(`${BACKEND_URL}/api/products`, {
        withCredentials: true,
      });
      setProducts(response.data.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.response?.data?.error || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setCurrentProduct({ 
      name: '', 
      description: '', 
      price: 0, 
      category: '', 
      stock: 0, 
      image: '', // Reset image field
      bestseller: false, 
      isNew: false 
    });
    setImageFile(null); // Clear any selected image file
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct({ ...product }); // Create a copy
    setImageFile(null); // Clear any selected image file
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const validateForm = () => {
    const errors = {};
    if (!currentProduct.name) errors.name = 'Name is required.';
    if (!currentProduct.description) errors.description = 'Description is required.';
    if (currentProduct.price <= 0) errors.price = 'Price must be greater than 0.';
    if (!currentProduct.category) errors.category = 'Category is required.';
    if (currentProduct.stock < 0) errors.stock = 'Stock cannot be negative.';
    if (!currentProduct._id && !imageFile && !currentProduct.image) {
      errors.image = 'Image is required for new products.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    setLoading(true);
    const formData = new FormData();
    for (const key in currentProduct) {
        if (key !== 'image' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
            formData.append(key, currentProduct[key]);
        }
    }
    if (imageFile) {
        formData.append('image', imageFile); // Append new image file
    } else if (currentProduct.image && typeof currentProduct.image === 'string') {
        formData.append('image', currentProduct.image); // Retain existing image path
    }


    try {
      if (currentProduct._id) {
        // Update existing product
        await axios.put(`${BACKEND_URL}/api/admin/products/${currentProduct._id}`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' } // Important for FormData
        });
      } else {
        // Add new product
        await axios.post(`${BACKEND_URL}/api/admin/products`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' } // Important for FormData
        });
      }
      setIsModalOpen(false);
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(err.response?.data?.error || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/products/${productId}`, {
        withCredentials: true,
      });
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError(err.response?.data?.error || 'Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && products.length === 0) { // Only show full loader if no products loaded yet
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E30B5D]"></div>
        <p className="ml-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Product Management</h2>
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-700">All Products</h3>
        <button 
          onClick={handleAddProduct}
          className="bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-2 rounded-lg font-medium flex items-center"
        >
          <FiPlus className="mr-2" /> Add New Product
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
                    <Image
                      src={getProductImageUrl(product.image)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={(e) => e.target.src = getProductImageUrl(null)} // Fallback
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEditProduct(product)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {currentProduct?._id ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="name" name="name" value={currentProduct.name} onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E30B5D] focus:border-[#E30B5D]"
                  required />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" value={currentProduct.description} onChange={handleFormChange}
                  rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E30B5D] focus:border-[#E30B5D]"
                  required></textarea>
                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                  <input type="number" id="price" name="price" value={currentProduct.price} onChange={handleFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E30B5D] focus:border-[#E30B5D]"
                    min="0.01" step="0.01" required />
                  {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <input type="text" id="category" name="category" value={currentProduct.category} onChange={handleFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E30B5D] focus:border-[#E30B5D]"
                    required />
                  {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                <input type="number" id="stock" name="stock" value={currentProduct.stock} onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E30B5D] focus:border-[#E30B5D]"
                  min="0" required />
                {formErrors.stock && <p className="text-red-500 text-xs mt-1">{formErrors.stock}</p>}
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Product Image</label>
                <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E30B5D] file:text-white hover:file:bg-[#c5094f]"
                />
                {currentProduct.image && !imageFile && (
                    <div className="mt-2 text-sm text-gray-600 flex items-center">
                        <span className="mr-2">Current Image:</span>
                        <Image src={getProductImageUrl(currentProduct.image)} alt="Current Product Image" width={50} height={50} className="rounded-md" />
                    </div>
                )}
                {formErrors.image && <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <input type="checkbox" id="bestseller" name="bestseller" checked={currentProduct.bestseller} onChange={handleFormChange}
                    className="h-4 w-4 text-[#E30B5D] focus:ring-[#E30B5D] border-gray-300 rounded" />
                  <label htmlFor="bestseller" className="ml-2 block text-sm text-gray-900">Bestseller</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="isNew" name="isNew" checked={currentProduct.isNew} onChange={handleFormChange}
                    className="h-4 w-4 text-[#E30B5D] focus:ring-[#E30B5D] border-gray-300 rounded" />
                  <label htmlFor="isNew" className="ml-2 block text-sm text-gray-900">New Product</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiX className="mr-2" /> Cancel
                </button>
                <button type="submit"
                  className="px-6 py-2 bg-[#E30B5D] hover:bg-[#c5094f] text-white rounded-lg flex items-center transition-colors"
                  disabled={loading} // Disable save button during loading
                >
                  <FiSave className="mr-2" /> {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
