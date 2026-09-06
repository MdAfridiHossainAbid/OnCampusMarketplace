import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';
const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other'];
const AVAILABILITY_OPTIONS = ['available', 'reserved', 'sold'];

function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Could not load your products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError('Please log in as a seller to manage your products.');
      setLoading(false);
      return;
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEditing = (product) => {
    setEditingId(product._id);
    setEditForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
    });
  };

  const handleSaveEdit = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...editForm, price: Number(editForm.price) }),
      });

      const updated = await response.json();
      if (!response.ok) throw new Error(updated.message || 'Could not update product');

      setProducts((prev) => prev.map((p) => (p._id === productId ? updated : p)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not delete product');
      }

      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAvailabilityChange = async (productId, availability) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability }),
      });

      const updated = await response.json();
      if (!response.ok) throw new Error(updated.message || 'Could not update availability');

      setProducts((prev) => prev.map((p) => (p._id === productId ? updated : p)));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading your products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>My Products</h1>

      {products.length === 0 ? (
        <p>You haven't listed anything yet.</p>
      ) : (
        products.map((product) => (
          <div
            key={product._id}
            style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}
          >
            {editingId === product._id ? (
              // Inline edit form
              <div>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
                <br />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
                <br />
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
                <br />
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <br />
                <button onClick={() => handleSaveEdit(product._id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              // Normal display
              <div>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <p>Price: ৳{product.price}</p>
                <p>Category: {product.category}</p>

                <label>
                  Availability:
                  <select
                    value={product.availability}
                    onChange={(e) => handleAvailabilityChange(product._id, e.target.value)}
                  >
                    {AVAILABILITY_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>

                <br />
                <button onClick={() => startEditing(product)}>Edit</button>
                <button onClick={() => handleDelete(product._id)}>Delete</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default MyProducts;
