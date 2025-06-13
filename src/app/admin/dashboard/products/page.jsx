// components/Admin/ProductManagement.jsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Removed redundant imports like Image from 'next/image' and FiIcons as they are handled by SVG/local components.


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'flame-n-crumble-2025';
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'diiopqo1y';


// Inline SVG icons for actions (replacing react-icons/fi)
const IconEdit = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const IconTrash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const IconPlus = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const IconSave = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-save"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);
const IconX = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const IconAlertCircle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-alert-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
const IconCheckCircle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.1"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);


// A simple message box component
const MessageBox = ({ type, message, onClose }) => {
    if (!message) return null;

    const baseClasses = "p-4 mb-4 rounded-md flex items-center shadow-sm";
    let typeClasses = "";
    let IconComponent = null;

    switch (type) {
        case 'success':
            typeClasses = "bg-green-100 border-l-4 border-green-500 text-green-700";
            IconComponent = IconCheckCircle;
            break;
        case 'error':
            typeClasses = "bg-red-100 border-l-4 border-red-500 text-red-700";
            IconComponent = IconAlertCircle;
            break;
        default:
            typeClasses = "bg-blue-100 border-l-4 border-blue-500 text-blue-700";
            IconComponent = IconAlertCircle; // Default icon
            break;
    }

    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            {IconComponent && <IconComponent className="mr-3 text-lg" />}
            <div className="flex-grow">
                <p className="font-medium">{message}</p>
            </div>
            {onClose && (
                <button onClick={onClose} className="ml-4 text-current hover:opacity-75">
                    <IconX size={18} />
                </button>
            )}
        </div>
    );
};

// Custom Confirmation Modal component
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative text-center">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Action</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// Extracted ProductRow component for individual image error handling
const ProductRow = ({ product, handleEditProduct, handleDeleteProduct, getProductImageUrl }) => {
    // State to manage the image source, allowing fallback to placeholder
    const [imageSrc, setImageSrc] = useState(getProductImageUrl(product.image));

    // Effect to update imageSrc if product.image changes (e.g., after an edit)
    useEffect(() => {
        setImageSrc(getProductImageUrl(product.image));
    }, [product.image, getProductImageUrl]); // getProductImageUrl is stable, but good practice to include

    // Handler for image loading errors
    const handleImageError = useCallback(() => {
        // Set the source to the placeholder image on error
        setImageSrc(getProductImageUrl(null));
    }, [getProductImageUrl]);

    return (
        <tr key={product._id}>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative w-16 h-16 rounded-md overflow-hidden">
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className="object-cover w-full h-full" // Use w-full h-full for object-fit: cover
                        onError={handleImageError}
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
                    <IconEdit />
                </button>
                <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="text-red-600 hover:text-red-900"
                >
                    <IconTrash />
                </button>
            </td>
        </tr>
    );
};


const ProductManagement = () => {
    // Reverted to local state management
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [successMessage, setSuccessMessage] = useState(null); // State for success messages
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null); // For edit/add form data
    const [formErrors, setFormErrors] = useState({});
    const [imageFile, setImageFile] = useState(null); // For new image upload file
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [productToDeleteId, setProductToDeleteId] = useState(null);

    // Memoized function for product image URL generation
    const getProductImageUrl = useCallback((imagePath) => {
        const placeholder = "https://placehold.co/100x100/e0e0e0/555555?text=No+Image";

        if (!imagePath) return placeholder;

        // If it's already a Cloudinary URL or full URL, return as-is
        if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
            return imagePath;
        }

        // If it's a Cloudinary public_id (without transformations)
        if (imagePath.startsWith('ecommerce-products/')) {
            return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_100,h_100,c_fill/${imagePath}`;
        }

        return placeholder;
    }, [CLOUDINARY_CLOUD_NAME]);


    // Fetch products on component mount
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null); // Clear messages on new fetch
        try {
            // Updated to use /api/admin/products for fetching as it's an admin-specific endpoint
            const response = await axios.get(`${BACKEND_URL}/api/products`, {
                withCredentials: true,
            });
            console.log('Fetched products:', response.data);
            setProducts(response.data || []); // Assuming backend returns { products: [...] }
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError(err.response?.data?.error || 'Failed to load products.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handler for adding a new product
    const handleAddProduct = () => {
        setCurrentProduct({
            name: '',
            description: '',
            price: 0,
            category: '',
            stock: 0,
            image: '', // Reset image field for new product
            bestseller: false,
            isNew: false
        });
        setImageFile(null); // Clear any previously selected image file
        setFormErrors({}); // Clear any previous form errors
        setIsModalOpen(true); // Open the modal
    };

    // Handler for editing an existing product
    const handleEditProduct = (product) => {
        setCurrentProduct({ ...product }); // Set currentProduct to the product being edited (a copy)
        setImageFile(null); // Clear any selected image file for upload
        setFormErrors({}); // Clear any previous form errors
        setIsModalOpen(true); // Open the modal
    };

    // Handler for changes in the form fields (updates currentProduct state)
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handler for image file selection
    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]); // Store the selected file object
    };

    // Form validation logic
    const validateForm = () => {
        const errors = {};
        if (!currentProduct.name) errors.name = 'Name is required.';
        if (!currentProduct.description) errors.description = 'Description is required.';
        if (parseFloat(currentProduct.price) <= 0) errors.price = 'Price must be greater than 0.';
        if (!currentProduct.category) errors.category = 'Category is required.';
        if (parseInt(currentProduct.stock) < 0) errors.stock = 'Stock cannot be negative.';

        // Image validation for new products (or if an existing image is removed)
        if (!currentProduct._id && !imageFile && !currentProduct.image) {
            errors.image = 'Image is required for new products.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0; // Return true if no errors
    };

    // Form submission handler (Add/Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            let imageUrl = currentProduct.image; // Keep existing image by default

            // If a new image file is selected, upload to Cloudinary via your backend
            if (imageFile) {
                // Create FormData for the image
                const formData = new FormData();
                formData.append('image', imageFile);

                // Upload to your backend which will handle Cloudinary upload
                const uploadResponse = await axios.post(
                    `${BACKEND_URL}/api/upload`, // Your backend upload endpoint
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        withCredentials: true
                    }
                );

                if (uploadResponse.data.success) {
                    imageUrl = uploadResponse.data.file.path; 
                    console.log('Image uploaded successfully:', imageUrl);
                    // Or whatever path your backend returns
                } else {
                    throw new Error(uploadResponse.data.error || 'Image upload failed');
                }
            }

            console.log('Image URL after upload:', imageUrl);
            // Prepare product data for backend
            const productData = {
                ...currentProduct,
                image: imageUrl,
                price: parseFloat(currentProduct.price),
                stock: parseInt(currentProduct.stock)
            };
            console.log('Product data to save:', productData);

            // Remove unused fields before sending
            // delete productData.__v;
            // delete productData.createdAt;
            // delete productData.updatedAt;

            // Determine if we're creating or updating
            const request = currentProduct._id
                ? axios.put(`${BACKEND_URL}/api/admin/products/${currentProduct._id}`, productData, {
                    withCredentials: true
                })
                : axios.post(`${BACKEND_URL}/api/admin/products`, productData, {
                    withCredentials: true
                });

            const response = await request;
            console.l
            setSuccessMessage(response.data.message || (currentProduct._id ? 'Product updated successfully!' : 'Product added successfully!'));

            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error('Failed to save product:', err);
            setError(err.response?.data?.error || err.message || 'Failed to save product.');
        } finally {
            setLoading(false);
        }
    };




    // Handler to initiate product deletion (opens confirmation modal)
    const confirmDeleteProduct = (productId) => {
        setProductToDeleteId(productId);
        setIsConfirmModalOpen(true);
    };

    // Handler to execute product deletion after confirmation
    const handleDeleteProduct = async () => {
        setIsConfirmModalOpen(false); // Close confirmation modal
        if (!productToDeleteId) return;

        setLoading(true); // Set loading state for the deletion
        setError(null);
        setSuccessMessage(null);

        try {
            await axios.delete(`${BACKEND_URL}/api/admin/products/${productToDeleteId}`, {
                withCredentials: true,
            });
            setSuccessMessage('Product deleted successfully!');
            fetchProducts(); // Refresh the product list
        } catch (err) {
            console.error('Failed to delete product:', err);
            setError(err.response?.data?.error || 'Failed to delete product.');
        } finally {
            setLoading(false); // End loading state
            setProductToDeleteId(null); // Clear product ID to delete
        }
    };

    // Display loading spinner when products are initially loading
    if (loading && products.length === 0) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E30B5D]"></div>
                <p className="ml-4 text-gray-600">Loading products...</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-lg shadow-md font-sans">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Product Management</h2>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-700">All Products</h3>
                <button
                    onClick={handleAddProduct}
                    className="bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors duration-200 ease-in-out shadow-md hover:shadow-lg"
                >
                    <IconPlus className="mr-2" /> Add New Product
                </button>
            </div>

            {/* Message display area */}
            <MessageBox type="error" message={error} onClose={() => setError(null)} />
            <MessageBox type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />

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
                            <ProductRow
                                key={product._id}
                                product={product}
                                handleEditProduct={handleEditProduct}
                                handleDeleteProduct={confirmDeleteProduct} // Use confirmDeleteProduct
                                getProductImageUrl={getProductImageUrl}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Product Add/Edit Modal */}
            {isModalOpen && currentProduct && ( // Ensure currentProduct is not null when modal is open
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <IconX size={24} />
                        </button>
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">
                            {currentProduct._id ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" id="name" name="name" value={currentProduct.name} onChange={handleFormChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E30B5D] focus:border-[#E30B5D] transition-all duration-150 ease-in-out"
                                    required />
                                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea id="description" name="description" value={currentProduct.description} onChange={handleFormChange}
                                    rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E30B5D] focus:border-[#E30B5D] transition-all duration-150 ease-in-out"
                                    required></textarea>
                                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                                    <input type="number" id="price" name="price" value={currentProduct.price} onChange={handleFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E30B5D] focus:border-[#E30B5D] transition-all duration-150 ease-in-out"
                                        min="0.01" step="0.01" required />
                                    {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
                                </div>
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                    <input type="text" id="category" name="category" value={currentProduct.category} onChange={handleFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E30B5D] focus:border-[#E30B5D] transition-all duration-150 ease-in-out"
                                        required />
                                    {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                                <input type="number" id="stock" name="stock" value={currentProduct.stock} onChange={handleFormChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E30B5D] focus:border-[#E30B5D] transition-all duration-150 ease-in-out"
                                    min="0" required />
                                {formErrors.stock && <p className="text-red-500 text-xs mt-1">{formErrors.stock}</p>}
                            </div>
                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Product Image</label>
                                <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E30B5D] file:text-white hover:file:bg-[#c5094f] transition-all duration-150 ease-in-out"
                                />
                                {currentProduct.image && !imageFile && (
                                    <div className="mt-2 text-sm text-gray-600 flex items-center">
                                        <span className="mr-2">Current Image:</span>
                                        {/* Display current image using getProductImageUrl */}
                                        <img src={getProductImageUrl(currentProduct.image)} alt="Current Product Image" width={50} height={50} className="rounded-md" />
                                    </div>
                                )}
                                {imageFile && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <span className="mr-2">Selected New Image:</span>
                                        <span className="font-semibold">{imageFile.name}</span>
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
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 ease-in-out"
                                >
                                    <IconX className="mr-2" /> Cancel
                                </button>
                                <button type="submit"
                                    className="px-6 py-2 bg-[#E30B5D] hover:bg-[#c5094f] text-white rounded-lg flex items-center transition-colors duration-200 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading} // Disable save button during loading
                                >
                                    <IconSave className="mr-2" /> {loading ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal for Delete */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                message="Are you sure you want to delete this product? This action cannot be undone."
                onConfirm={handleDeleteProduct}
                onCancel={() => {
                    setIsConfirmModalOpen(false);
                    setProductToDeleteId(null);
                }}
            />
        </div>
    );
};

export default ProductManagement;