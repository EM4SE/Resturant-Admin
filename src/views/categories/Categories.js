import React, { useState, useEffect } from 'react';
import {
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
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';

const Categories = () => {
  const [tableCategories, setTableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState({ text: '', type: '' });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [currentItem, setCurrentItem] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/category/getallcategories');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      if (data.code === '00') {
        setTableCategories(data.content);
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A';
    const date = new Date(datetime);
    return date.toLocaleString(); // Formats as "MM/DD/YYYY, HH:MM:SS AM/PM"
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/category/updatecategory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItem),
      });
      const data = await response.json();
      const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
      setResponseMessage({ text: data.message || 'Update failed', type: messageType });
      if (messageType === 'success') {
        fetchCategories(); // Refresh the category list
        setEditModalVisible(false);
      }
    } catch (error) {
      setResponseMessage({ text: error.message || 'Update failed', type: 'danger' });
    }
  };

  const handleDelete = (item) => {
    setCurrentItem(item);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/category/deletecategory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentItem.id }),
      });
      const data = await response.json();
      const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
      setResponseMessage({ text: data.message || 'Delete failed', type: messageType });
      if (messageType === 'success') {
        fetchCategories(); // Refresh the category list
      }
      setDeleteModalVisible(false);
    } catch (error) {
      setResponseMessage({ text: error.message || 'Delete failed', type: 'danger' });
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/category/addcategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      const data = await response.json();
      const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
      setResponseMessage({ text: data.message || 'Add failed', type: messageType });
      if (messageType === 'success') {
        fetchCategories(); // Refresh the category list
        setAddModalVisible(false);
        setNewCategory({ name: '', description: '' }); // Reset form
      }
    } catch (error) {
      setResponseMessage({ text: error.message || 'Add failed', type: 'danger' });
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
              Categories List
              <CButton
                color="success"
                size="sm"
                className="float-end"
                onClick={() => setAddModalVisible(true)}
              >
                Add Category
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
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell>Description</CTableHeaderCell>
                        <CTableHeaderCell>Created At</CTableHeaderCell>
                        <CTableHeaderCell>Updated At</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {tableCategories.map((item) => (
                        <CTableRow key={item.id}>
                          <CTableDataCell>{item.id}</CTableDataCell>
                          <CTableDataCell>{item.name}</CTableDataCell>
                          <CTableDataCell>{item.description}</CTableDataCell>
                          <CTableDataCell>{formatDateTime(item.createdAt)}</CTableDataCell>
                          <CTableDataCell>{formatDateTime(item.updatedAt)}</CTableDataCell>
                          <CTableDataCell>
                            <CButton color="primary" size="sm" onClick={() => handleEdit(item)}>
                              Edit
                            </CButton>{' '}
                            <CButton color="danger" size="sm" onClick={() => handleDelete(item)}>
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

      {/* Add Modal */}
      <CModal visible={addModalVisible} onClose={() => setAddModalVisible(false)}>
        <CModalHeader>Add New Category</CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label>Name</label>
            <CFormInput
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label>Description</label>
            <CFormInput
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setAddModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="success" onClick={handleAdd}>
            Add
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Modal */}
      {currentItem && (
        <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
          <CModalHeader>Edit Category</CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <label>Name</label>
              <CFormInput
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Description</label>
              <CFormInput
                value={currentItem.description}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSave}>
              Save
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader>Confirm Delete</CModalHeader>
        <CModalBody>
          Are you sure you want to delete category <strong>{currentItem?.name}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Categories;
