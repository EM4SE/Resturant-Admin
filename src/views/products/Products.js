import React, { useState, useEffect } from 'react';
import {
    CAvatar,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CFormInput,
    CFormSelect,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react';

const Products = () => {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responseMessage, setResponseMessage] = useState({ text: '', type: '' });

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);

    const [currentProduct, setCurrentProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        availability: true,
        image: null,
    });

    useEffect(() => {
        const initialize = async () => {
            await fetchCategories(); // Fetch categories first
            await fetchProducts(); // Then fetch products
        };
        initialize();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/products/getallproducts');
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();

            if (data.code === '00') {
                // Convert availability to a boolean value
                const updatedProducts = data.content.map(product => ({
                    ...product,
                    availability: product.availability === 'true' // Convert 'true' string to true, 'false' to false
                }));
                setProducts(updatedProducts);
            } else {
                throw new Error(data.message || 'Failed to fetch products');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    const handleView = (product) => {
        setCurrentProduct(product);
        setViewModalVisible(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };



    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/category/getallcategories');
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            if (data.code === '00') {
                setCategories(data.content);
            } else {
                throw new Error(data.message || 'Failed to fetch categories');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEdit = (product) => {
        setCurrentProduct({
            ...product,
            categoryName: product.category, // Set the category name directly
            availability: Boolean(product.availability) // Ensure availability is boolean
        });
        setEditModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('id', currentProduct.id);
            formData.append('name', currentProduct.name);
            formData.append('description', currentProduct.description);
            formData.append('price', currentProduct.price);
            formData.append('category', currentProduct.category); // Send category name instead of ID
            formData.append('availability', currentProduct.availability);
            if (currentProduct.image) {
                formData.append('image', currentProduct.image);
            }

            const response = await fetch('http://localhost:8080/api/products/editproduct', {
                method: 'PUT',
                body: formData, // Remove headers since we're using FormData
            });

            const data = await response.json();
            const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
            setResponseMessage({ text: data.message || 'Update failed', type: messageType });
            if (messageType === 'success') {
                fetchProducts();
                setEditModalVisible(false);
            }
        } catch (error) {
            setResponseMessage({ text: error.message || 'Update failed', type: 'danger' });
        }
    };

    const handleDelete = (product) => {
        setCurrentProduct(product);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/products/deleteproduct', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentProduct.id }),
            });
            const data = await response.json();
            const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
            setResponseMessage({ text: data.message || 'Delete failed', type: messageType });
            if (messageType === 'success') {
                fetchProducts();
            }
            setDeleteModalVisible(false);
        } catch (error) {
            setResponseMessage({ text: error.message || 'Delete failed', type: 'danger' });
        }
    };

    const handleAdd = async () => {
        try {
            const formData = new FormData();
            formData.append('name', newProduct.name);
            formData.append('description', newProduct.description);
            formData.append('price', newProduct.price);
            formData.append('category', newProduct.category);
            formData.append('availability', newProduct.availability);
            if (newProduct.image) {
                formData.append('image', newProduct.image);
            }

            const response = await fetch('http://localhost:8080/api/products/addproduct', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            const messageType = response.ok && data.code === '00' ? 'success' : 'danger';

            setResponseMessage({
                text: data.message || 'Add failed',
                type: messageType
            });

            if (messageType === 'success') {
                fetchProducts();
                setAddModalVisible(false);
                setNewProduct({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    availability: true,
                    image: null
                });
            } else {
                console.error(data.message || 'Add failed');
            }
        } catch (error) {
            setResponseMessage({
                text: error.message || 'Add failed',
                type: 'danger'
            });
            console.error(error.message || 'Add failed');
        }
    };


    const handleCloseResponseMessage = () => {
        setResponseMessage({ text: '', type: '' });
    };

    return (
        <>
            <CRow>
                <CCol xs>
                    <CCard className="mb-4">
                        <CCardHeader>
                            Product List
                            <CButton
                                color="success"
                                size="sm"
                                className="float-end"
                                onClick={() => setAddModalVisible(true)}
                            >
                                Add Product
                            </CButton>
                        </CCardHeader>
                        <CCardBody>
                            {loading ? (
                                <div>Loading...</div>
                            ) : error ? (
                                <div className="text-danger">{error}</div>
                            ) : (
                                <>
                                    {responseMessage.text && (
                                        <div
                                            className={`mb-3 alert alert-${responseMessage.type} d-flex justify-content-between`}
                                        >
                                            <span>{responseMessage.text}</span>
                                            <CButton
                                                color="light"
                                                size="sm"
                                                onClick={handleCloseResponseMessage}
                                                className="text-danger"
                                            >
                                                ✖
                                            </CButton>
                                        </div>
                                    )}
                                    <CTable align="middle" className="mb-0 border" hover responsive>
                                        <CTableHead>
                                            <CTableRow>
                                                <CTableHeaderCell>ID</CTableHeaderCell>
                                                <CTableHeaderCell>Image</CTableHeaderCell>
                                                <CTableHeaderCell>Name</CTableHeaderCell>
                                                <CTableHeaderCell>Description</CTableHeaderCell>
                                                <CTableHeaderCell>Price</CTableHeaderCell>
                                                <CTableHeaderCell>Category</CTableHeaderCell>
                                                <CTableHeaderCell>Availability</CTableHeaderCell>
                                                <CTableHeaderCell>Actions</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {products.map((product) => (
                                                <CTableRow key={product.id}>
                                                    <CTableDataCell>{product.id}</CTableDataCell>
                                                    <CTableDataCell>
                                                        <img
                                                            src={`http://localhost:8080/images/${product.imagePath}`}
                                                            alt={product.name}
                                                            style={{ width: '50px', height: '50px', borderRadius: '10%' }}
                                                        />
                                                    </CTableDataCell>
                                                    <CTableDataCell>{product.name}</CTableDataCell>
                                                    <CTableDataCell>{product.description}</CTableDataCell>
                                                    <CTableDataCell>{product.price}</CTableDataCell>
                                                    <CTableDataCell>{product.category}</CTableDataCell>

                                                    <CTableDataCell>
                                                        <span className={`badge ${product.availability ? 'bg-success' : 'bg-danger'}`}>
                                                            {product.availability ? 'Available' : 'Not Available'}
                                                        </span>
                                                    </CTableDataCell>


                                                    <CTableDataCell>
                                                        <CButton color="info" size="sm" onClick={() => handleView(product)} className="me-2">
                                                            View
                                                        </CButton>
                                                        <CButton color="primary" size="sm" onClick={() => handleEdit(product)}>
                                                            Edit
                                                        </CButton>{' '}
                                                        <CButton color="danger" size="sm" onClick={() => handleDelete(product)}>
                                                            Delete
                                                        </CButton>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))}
                                        </CTableBody>
                                    </CTable>
                                </>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* View Modal */}
            <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)} size="lg">
                <CModalHeader>Product Details</CModalHeader>
                <CModalBody>
                    {currentProduct && (
                        <div className="row">
                            <div className="col-md-6">
                                <img
                                    src={`http://localhost:8080/images/${currentProduct.imagePath}`}
                                    alt={currentProduct.name}
                                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                />
                            </div>
                            <div className="col-md-6">
                                <h3>{currentProduct.name}</h3>
                                <p><strong>Description:</strong> {currentProduct.description}</p>
                                <p><strong>Price:</strong> ${currentProduct.price}</p>
                                <p><strong>Category:</strong> {currentProduct.category}</p>
                                <p>
                                    <strong>Availability:</strong>{' '}
                                    <span className={`badge ${currentProduct.availability ? 'bg-success' : 'bg-danger'}`}>
                                        {currentProduct.availability ? 'Available' : 'Not Available'}
                                    </span>
                                </p>
                                <p><strong>Created At:</strong> {formatDate(currentProduct.createdAt)}</p>
                                <p><strong>Updated At:</strong> {formatDate(currentProduct.updatedAt)}</p>
                            </div>
                        </div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Add Modal */}
            <CModal visible={addModalVisible} onClose={() => setAddModalVisible(false)}>
                <CModalHeader>Add New Product</CModalHeader>
                <CModalBody>
                    <div className="mb-3">
                        <label>Name</label>
                        <CFormInput
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label>Description</label>
                        <CFormInput
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label>Price</label>
                        <CFormInput
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label>Category</label>
                        <CFormSelect
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </CFormSelect>
                    </div>
                    <div className="mb-3">
                        <label>Availability</label>
                        <CFormSelect
                            value={newProduct.availability.toString()}
                            onChange={(e) =>
                                setNewProduct({ ...newProduct, availability: e.target.value === 'true' })
                            }
                        >
                            <option value="true">Available</option>
                            <option value="false">Not Available</option>
                        </CFormSelect>
                    </div>
                    <div className="mb-3">
                        <label>Image</label>
                        <CFormInput
                            type="file"
                            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                        />
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton color="success" onClick={handleAdd}>
                        Add
                    </CButton>{' '}
                    <CButton color="secondary" onClick={() => setAddModalVisible(false)}>
                        Cancel
                    </CButton>
                </CModalFooter>
            </CModal>



            {/* Edit Modal */}
            <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
                <CModalHeader>Edit Product</CModalHeader>
                <CModalBody>
                    <div className="mb-3">
                        <label>Name</label>
                        <CFormInput
                            value={currentProduct?.name || ''}
                            onChange={(e) =>
                                setCurrentProduct({ ...currentProduct, name: e.target.value })
                            }
                        />
                    </div>
                    <div className="mb-3">
                        <label>Description</label>
                        <CFormInput
                            value={currentProduct?.description || ''}
                            onChange={(e) =>
                                setCurrentProduct({ ...currentProduct, description: e.target.value })
                            }
                        />
                    </div>
                    <div className="mb-3">
                        <label>Price</label>
                        <CFormInput
                            type="number"
                            value={currentProduct?.price || ''}
                            onChange={(e) =>
                                setCurrentProduct({ ...currentProduct, price: e.target.value })
                            }
                        />
                    </div>
                    <div className="mb-3">
                        <label>Category</label>
                        <CFormSelect
                            value={currentProduct?.category || ''}
                            onChange={(e) =>
                                setCurrentProduct({ ...currentProduct, category: e.target.value })
                            }
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </CFormSelect>
                    </div>
                    <div className="mb-3">
                        <label>Availability</label>
                        <CFormSelect
                            value={currentProduct?.availability.toString()}
                            onChange={(e) =>
                                setCurrentProduct({ ...currentProduct, availability: e.target.value === 'true' })
                            }
                        >
                            <option value="true">Available</option>
                            <option value="false">Not Available</option>
                        </CFormSelect>
                    </div>
                    <div className="mb-3">
                        <label>Image</label>
                        <CFormInput
                            type="file"
                            onChange={(e) =>
                                setCurrentProduct({ ...currentProduct, image: e.target.files[0] })
                            }
                        />
                        {currentProduct?.imagePath && (
                            <img
                                src={`http://localhost:8080/images/${currentProduct.imagePath}`}
                                alt="Current"
                                style={{ width: '100px', marginTop: '10px' }}
                            />
                        )}
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton color="primary" onClick={handleSave}>
                        Save
                    </CButton>{' '}
                    <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
                        Cancel
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Delete Confirmation Modal */}
            <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
                <CModalHeader>Delete Confirmation</CModalHeader>
                <CModalBody>
                    Are you sure you want to delete the product "{currentProduct?.name}"?
                </CModalBody>
                <CModalFooter>
                    <CButton color="danger" onClick={confirmDelete}>
                        Yes, Delete
                    </CButton>{' '}
                    <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
                        Cancel
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    );
};

export default Products;