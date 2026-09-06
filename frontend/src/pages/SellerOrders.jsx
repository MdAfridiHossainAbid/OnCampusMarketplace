import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';
const STATUS_OPTIONS = ['Pending', 'Completed', 'Cancelled'];

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to see your orders.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/seller`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Could not load orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not update status');
      }

      const updatedOrder = await response.json();
      // Update just this one order in local state instead of refetching everything
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Orders on My Products</h1>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}
          >
            <h3>Order #{order._id.slice(-6)}</h3>
            <p>Product: {order.productId?.title}</p>
            <p>Buyer: {order.buyerId?.name}</p>
            <p>Pickup: {order.pickupLocation}</p>
            <p>Total: ৳{order.totalPrice}</p>

            <label>
              Status:
              <select
                value={order.status}
                disabled={updatingId === order._id}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))
      )}
    </div>
  );
}

export default SellerOrders;
