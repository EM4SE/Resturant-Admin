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
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';

const Orders = () => {
  const [orderData, setOrderData] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/orders/getallorders');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      if (data.code === '00') {
        setOrderData(data.content);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    setLoadingItems(true);
    try {
      const response = await fetch('http://localhost:8080/api/orders/getorderitems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      if (data.code === '00') {
        setOrderItems(data.content);
      } else {
        throw new Error(data.message || 'Failed to fetch order items');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingItems(false);
    }
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A';
    const date = new Date(datetime);
    return date.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-warning';
      case 'COMPLETED':
        return 'text-success';
      case 'CANCELLED':
        return 'text-danger';
      default:
        return '';
    }
  };

  const handleView = async (order) => {
    setCurrentOrder(order);
    setViewModalVisible(true);
    await fetchOrderItems(order.id);
  };

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>
              Orders List
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="text-danger">{error}</div>
              ) : (
                <CTable align="middle" className="mb-0 border" hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>Table Number</CTableHeaderCell>
                      <CTableHeaderCell>Order Type</CTableHeaderCell>
                      <CTableHeaderCell>Table Assistant</CTableHeaderCell>
                      <CTableHeaderCell>Customers</CTableHeaderCell>
                      <CTableHeaderCell>Order Date</CTableHeaderCell>
                      <CTableHeaderCell>Total Amount</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {orderData.map((order) => (
                      <CTableRow key={order.id}>
                        <CTableDataCell>{order.id}</CTableDataCell>
                        <CTableDataCell>Table {order.tableNumber}</CTableDataCell>
                        <CTableDataCell>{order.orderType}</CTableDataCell>
                        <CTableDataCell>{order.tableAssistant}</CTableDataCell>
                        <CTableDataCell>{order.numberOfCustomers}</CTableDataCell>
                        <CTableDataCell>{formatDateTime(order.orderedAt)}</CTableDataCell>
                        <CTableDataCell>{formatCurrency(order.totalAmount)}</CTableDataCell>
                        <CTableDataCell className={getStatusClass(order.orderStatus)}>
                          {order.orderStatus}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton color="info" size="sm" onClick={() => handleView(order)}>
                            View Bill
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* View Bill Modal */}
      {currentOrder && (
  <CModal 
    visible={viewModalVisible} 
    onClose={() => setViewModalVisible(false)}
    size="lg"
  >
    <CModalHeader>
      <h5>Bill Details - Order #{currentOrder.id}</h5>
    </CModalHeader>
    <CModalBody>
      <div className="mb-3">
        <strong>Table Number:</strong> {currentOrder.tableNumber}<br />
        <strong>Order Type:</strong> {currentOrder.orderType}<br />
        <strong>Table Assistant:</strong> {currentOrder.tableAssistant}<br />
        <strong>Number of Customers:</strong> {currentOrder.numberOfCustomers}<br />
        <strong>Order Date:</strong> {formatDateTime(currentOrder.orderedAt)}<br />
        <strong>Status:</strong> <span className={getStatusClass(currentOrder.orderStatus)}>{currentOrder.orderStatus}</span>
      </div>
      
      {loadingItems ? (
        <div>Loading items...</div>
      ) : (
        <CTable bordered>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Item Name</CTableHeaderCell>
              <CTableHeaderCell>Special Note</CTableHeaderCell>
              <CTableHeaderCell>Quantity</CTableHeaderCell>
              <CTableHeaderCell>Unit Price</CTableHeaderCell>
              <CTableHeaderCell>Total Price</CTableHeaderCell>
              
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {orderItems.map((item) => (
              <CTableRow key={item.id}>
                <CTableDataCell>{item.itemName}</CTableDataCell>
                <CTableDataCell>{item.specialNote || '-'}</CTableDataCell>
                <CTableDataCell>{item.quantity}</CTableDataCell>
                <CTableDataCell>{formatCurrency(item.unitPrice)}</CTableDataCell>
                <CTableDataCell>{formatCurrency(item.totalPrice)}</CTableDataCell>
                
              </CTableRow>
            ))}
            <CTableRow>
              <CTableDataCell colSpan="4" className="text-end">
                <strong>Total Amount:</strong>
              </CTableDataCell>
              <CTableDataCell>
                <strong>{formatCurrency(currentOrder.totalAmount)}</strong>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      )}
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
        Close
      </CButton>
    </CModalFooter>
  </CModal>
)}
    </>
  );
};

export default Orders;