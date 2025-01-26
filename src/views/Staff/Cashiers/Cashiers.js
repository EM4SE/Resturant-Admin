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
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';


const Cashiers = () => {
  const [cashierData, setCashierData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState({ text: '', type: '' });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [passwordChangeModalVisible, setPasswordChangeModalVisible] = useState(false);

  const [currentItem, setCurrentItem] = useState(null);
  const [newCashier, setNewCashier] = useState({ 
    name: '', 
    username: '', 
    mobile: '', 
    status: 'active',
    password: '',
    confirmPassword: ''
  });

  const [passwordChangeData, setPasswordChangeData] = useState({
    cashierId: null,
    newPassword: '',
    confirmNewPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');


  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/cashiers/getallcashiers');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      if (data.code === '00') {
        setCashierData(data.content);
      } else {
        throw new Error(data.message || 'Failed to fetch cashiers');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    // Add password validation
    if (newCashier.password !== newCashier.confirmPassword) {
      setResponseMessage({ 
        text: 'Passwords do not match', 
        type: 'danger' 
      });
      return;
    }
    
    if (newCashier.password.length < 6) {
      setResponseMessage({ 
        text: 'Password must be at least 6 characters', 
        type: 'danger' 
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/cashiers/addCashier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCashier.name,
          username: newCashier.username,
          mobile: newCashier.mobile,
          status: newCashier.status,
          password: newCashier.password
        }),
      });
      const data = await response.json();
      const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
      setResponseMessage({ text: data.message || 'Add failed', type: messageType });
      if (messageType === 'success') {
        fetchCashiers();
        setAddModalVisible(false);
        setNewCashier({ 
          name: '', 
          username: '', 
          mobile: '', 
          status: 'active',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setResponseMessage({ text: error.message || 'Add failed', type: 'danger' });
    }
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A';
    const date = new Date(datetime);
    return date.toLocaleString();
  };

  const getStatusClass = (status) => {
    return status === 'active' ? 'text-success' : 'text-danger';
  };

  const validatePasswordChange = () => {
    if (passwordChangeData.newPassword !== passwordChangeData.confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }
    if (passwordChangeData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEdit = (item) => {
    setCurrentItem({ ...item });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/cashiers/updateCashier', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItem),
      });
      const data = await response.json();
      const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
      setResponseMessage({ text: data.message || 'Update failed', type: messageType });
      if (messageType === 'success') {
        fetchCashiers();
        setEditModalVisible(false);
      }
    } catch (error) {
      setResponseMessage({ text: error.message || 'Update failed', type: 'danger' });
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordChange()) return;

    try {
      const response = await fetch('http://localhost:8080/api/cashiers/changePassword', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: passwordChangeData.cashierId,
          password: passwordChangeData.newPassword
        }),
      });
      const data = await response.json();
      const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
      setResponseMessage({ text: data.message || 'Password change failed', type: messageType });
      if (messageType === 'success') {
        setPasswordChangeModalVisible(false);
        setPasswordChangeData({
          cashierId: null,
          newPassword: '',
          confirmNewPassword: ''
        });
      }
    } catch (error) {
      setResponseMessage({ text: error.message || 'Password change failed', type: 'danger' });
    }
  };

  const handleDelete = (item) => {
    setCurrentItem(item);
    setDeleteModalVisible(true);
  };

  const handlePasswordChangeModal = (item) => {
    setPasswordChangeData({
      cashierId: item.id,
      newPassword: '',
      confirmNewPassword: ''
    });
    setPasswordChangeModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/cashiers/deleteCashier', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentItem.id }),
      });
      const data = await response.json();
      const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
      setResponseMessage({ text: data.message || 'Delete failed', type: messageType });
      if (messageType === 'success') {
        fetchCashiers();
      }
      setDeleteModalVisible(false);
    } catch (error) {
      setResponseMessage({ text: error.message || 'Delete failed', type: 'danger' });
    }
  };

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>
              Cashiers List
              <CButton
                color="success"
                size="sm"
                className="float-end"
                onClick={() => setAddModalVisible(true)}
              >
                Add Cashier
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
                    <div className={`mb-3 alert alert-${responseMessage.type}`}>
                      {responseMessage.text}
                    </div>
                  )}
                  <CTable align="middle" className="mb-0 border" hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>ID</CTableHeaderCell>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell>Username</CTableHeaderCell>
                        <CTableHeaderCell>Mobile</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Created At</CTableHeaderCell>
                        <CTableHeaderCell>Updated At</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {cashierData.map((item) => (
                        <CTableRow key={item.id}>
                          <CTableDataCell>{item.id}</CTableDataCell>
                          <CTableDataCell>{item.name}</CTableDataCell>
                          <CTableDataCell>{item.username}</CTableDataCell>
                          <CTableDataCell>{item.mobile}</CTableDataCell>
                          <CTableDataCell className={getStatusClass(item.status)}>
                            {item.status}
                          </CTableDataCell>
                          <CTableDataCell>{formatDateTime(item.createdAt)}</CTableDataCell>
                          <CTableDataCell>{formatDateTime(item.updatedAt)}</CTableDataCell>
                          <CTableDataCell>
                            <CButton color="primary" size="sm" onClick={() => handleEdit(item)}>
                              Edit
                            </CButton>{' '}
                            <CButton color="warning" size="sm" onClick={() => handlePasswordChangeModal(item)}>
                              Change Password
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
        <CModalHeader>Add New Cashier</CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label>Name</label>
            <CFormInput
              type="text"
              value={newCashier.name}
              onChange={(e) => setNewCashier({ ...newCashier, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label>Username</label>
            <CFormInput
              type="text"
              value={newCashier.username}
              onChange={(e) => setNewCashier({ ...newCashier, username: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label>Mobile</label>
            <CFormInput
              type="number"
              value={newCashier.mobile}
              onChange={(e) => setNewCashier({ ...newCashier, mobile: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label>Status</label>
            <CFormSelect
              value={newCashier.status}
              onChange={(e) => setNewCashier({ ...newCashier, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </CFormSelect>
          </div>
          <div className="mb-3">
        <label>Password</label>
        <CFormInput
          type="password"
          value={newCashier.password}
          onChange={(e) => setNewCashier({ ...newCashier, password: e.target.value })}
        />
      </div>
      <div className="mb-3">
        <label>Confirm Password</label>
        <CFormInput
          type="password"
          value={newCashier.confirmPassword}
          onChange={(e) => setNewCashier({ ...newCashier, confirmPassword: e.target.value })}
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
          <CModalHeader>Edit Cashier</CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <label>Name</label>
              <CFormInput
                type="text"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Username</label>
              <CFormInput
                type="text"
                value={currentItem.username}
                onChange={(e) => setCurrentItem({ ...currentItem, username: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Mobile</label>
              <CFormInput
                type="number"
                value={currentItem.mobile}
                onChange={(e) => setCurrentItem({ ...currentItem, mobile: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Status</label>
              <CFormSelect
                value={currentItem.status}
                onChange={(e) => setCurrentItem({ ...currentItem, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </CFormSelect>
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

      {/* Change Password Modal */}
      <CModal visible={passwordChangeModalVisible} onClose={() => setPasswordChangeModalVisible(false)}>
        <CModalHeader>Change Password</CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label>New Password</label>
            <CFormInput
              type="password"
              value={passwordChangeData.newPassword}
              onChange={(e) => setPasswordChangeData({ 
                ...passwordChangeData, 
                newPassword: e.target.value 
              })}
            />
          </div>
          <div className="mb-3">
            <label>Confirm New Password</label>
            <CFormInput
              type="password"
              value={passwordChangeData.confirmNewPassword}
              onChange={(e) => setPasswordChangeData({ 
                ...passwordChangeData, 
                confirmNewPassword: e.target.value 
              })}
            />
          </div>
          {passwordError && (
            <div className="text-danger mb-3">{passwordError}</div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setPasswordChangeModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleChangePassword}>
            Change Password
          </CButton>
        </CModalFooter>
      </CModal>

          {/* Delete Modal */}
          {currentItem && (
        <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
          <CModalHeader>Confirm Delete</CModalHeader>
          <CModalBody>
            Are you sure you want to delete cashier <strong>{currentItem.name}</strong>?
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
      )}
    </>
  );
};

export default Cashiers;