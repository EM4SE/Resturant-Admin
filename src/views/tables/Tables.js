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

const Tables = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState({ text: '', type: '' });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [currentItem, setCurrentItem] = useState(null);
  const [newTable, setNewTable] = useState({ number: '', seats: '', status: 'Available' });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/table/getalltables');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      if (data.code === '00') {
        setTableData(data.content);
      } else {
        throw new Error(data.message || 'Failed to fetch tables');
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'Available':
        return 'text-success';
      case 'Occupied':
        return 'text-danger';
      case 'Reserved':
        return 'text-warning';
      default:
        return '';
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/table/updatetable', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItem),
      });
      const data = await response.json();
      const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
      setResponseMessage({ text: data.message || 'Update failed', type: messageType });
      if (messageType === 'success') {
        fetchTables();
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
      const response = await fetch('http://localhost:8080/api/table/deletetable', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentItem.id }),
      });
      const data = await response.json();
      const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
      setResponseMessage({ text: data.message || 'Delete failed', type: messageType });
      if (messageType === 'success') {
        fetchTables();
      }
      setDeleteModalVisible(false);
    } catch (error) {
      setResponseMessage({ text: error.message || 'Delete failed', type: 'danger' });
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/table/addtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTable),
      });
      const data = await response.json();
      const messageType = response.ok && data.code === '00' ? 'success' : 'danger';
      setResponseMessage({ text: data.message || 'Add failed', type: messageType });
      if (messageType === 'success') {
        fetchTables();
        setAddModalVisible(false);
        setNewTable({ number: '', seats: '', status: 'Available' });
      }
    } catch (error) {
      setResponseMessage({ text: error.message || 'Add failed', type: 'danger' });
    }
  };

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>
              Tables List
              <CButton
                color="success"
                size="sm"
                className="float-end"
                onClick={() => setAddModalVisible(true)}
              >
                Add Table
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
                        <CTableHeaderCell>Number</CTableHeaderCell>
                        <CTableHeaderCell>Seats</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Created At</CTableHeaderCell>
                        <CTableHeaderCell>Updated At</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {tableData.map((item) => (
                        <CTableRow key={item.id}>
                          <CTableDataCell>{item.id}</CTableDataCell>
                          <CTableDataCell>Table {item.number}</CTableDataCell>
                          <CTableDataCell>{item.seats}</CTableDataCell>
                          <CTableDataCell className={getStatusClass(item.status)}>
                            {item.status}
                          </CTableDataCell>
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
        <CModalHeader>Add New Table</CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label>Number</label>
            <CFormInput
              type="number"
              value={newTable.number}
              onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label>Seats</label>
            <CFormInput
              type="number"
              value={newTable.seats}
              onChange={(e) => setNewTable({ ...newTable, seats: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label>Status</label>
            <CFormSelect
              value={newTable.status}
              onChange={(e) => setNewTable({ ...newTable, status: e.target.value })}
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
            </CFormSelect>
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
          <CModalHeader>Edit Table</CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <label>Number</label>
              <CFormInput
                type="number"
                value={currentItem.number}
                onChange={(e) => setCurrentItem({ ...currentItem, number: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Seats</label>
              <CFormInput
                type="number"
                value={currentItem.seats}
                onChange={(e) => setCurrentItem({ ...currentItem, seats: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Status</label>
              <CFormSelect
                value={currentItem.status}
                onChange={(e) => setCurrentItem({ ...currentItem, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
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
      {/* Delete Modal */}
      {currentItem && (
        <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
          <CModalHeader>Confirm Delete</CModalHeader>
          <CModalBody>
            Are you sure you want to delete table <strong>{currentItem.number}</strong>?
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

export default Tables;
