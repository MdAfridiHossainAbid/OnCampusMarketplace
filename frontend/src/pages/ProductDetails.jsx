import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Order flow state
  const [quantity, setQuantity] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isConfirming, setIsConfirming] = useState(false); // false = editing, true = showing confirm step
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, locationsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products/${id}`),
          fetch(`${API_BASE_URL}/pickup-locations`),
        ]);

        if (!productRes.ok) throw new Error('Product not found');

        const productData = await productRes.json();
        const locationsData = await locationsRes.json();

        setProduct(productData);
        setPickupLocations(locationsData);
      } catch (error) {
        setStatusMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Step: Quantity + Pickup Location -> "Review Order" moves to the confirm step
  const handleReviewOrder = () => {
    if (!selectedLocation) {
      setStatusMessage('Please choose a pickup location.');
      return;
    }
    setStatusMessage('');
    setIsConfirming(true);
  };

  // Step: Confirm Order -> actually submits to the backend
  const handleConfirmOrder = async () => {
    setStatusMessage('');
    const token = localStorage.getItem('token');

    if (!token) {
      setStatusMessage('Please log in before placing an order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: id,
          quantity,
          pickupLocation: selectedLocation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(data.message || 'Could not place order');
        setIsSubmitting(false);
        return;
      }

      setOrderPlaced(true);
    } catch (error) {
      setStatusMessage('Network error — is the backend running?');
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>{statusMessage || 'Product not found.'}</p>;

  if (orderPlaced) {
    return <p>Order placed! Status: Pending. The seller will confirm pickup at {selectedLocation}.</p>;
  }

  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Category: {product.category}</p>
      <p>Availability: {product.availability}</p>

      <h3>Seller</h3>
      <p>Name: {product.sellerId?.name}</p>
      <p>Email: {product.sellerId?.email}</p>

      {product.availability !== 'available' ? (
        <p>This product is no longer available.</p>
      ) : !isConfirming ? (
        // Step 1: Quantity + Pickup Location
        <div>
          <h3>Place an Order</h3>

          <label>
            Quantity:
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>

          <fieldset>
            <legend>Pickup Location</legend>
            {pickupLocations.map((location) => (
              <label key={location} style={{ display: 'block' }}>
                <input
                  type="radio"
                  name="pickupLocation"
                  value={location}
                  checked={selectedLocation === location}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                />
                {location}
              </label>
            ))}
          </fieldset>

          <button onClick={handleReviewOrder}>Review Order</button>
        </div>
      ) : (
        // Step 2: Confirm Order
        <div>
          <h3>Confirm Your Order</h3>
          <p>Product: {product.title}</p>
          <p>Quantity: {quantity}</p>
          <p>Total: ${(product.price * quantity).toFixed(2)}</p>
          <p>Pickup Location: {selectedLocation}</p>

          <button onClick={() => setIsConfirming(false)} disabled={isSubmitting}>
            Back
          </button>
          <button onClick={handleConfirmOrder} disabled={isSubmitting}>
            {isSubmitting ? 'Placing order...' : 'Confirm Order'}
          </button>
        </div>
      )}

      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
}

export default ProductDetails;
