import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter inputs (Feature 8) — separate from the values actually applied,
  // so typing doesn't refetch on every keystroke.
  const [keywordInput, setKeywordInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      // Build the query string from whichever filters are actually set
      const params = new URLSearchParams();
      if (appliedFilters.keyword) params.append('keyword', appliedFilters.keyword);
      if (appliedFilters.category) params.append('category', appliedFilters.category);
      if (appliedFilters.minPrice) params.append('minPrice', appliedFilters.minPrice);
      if (appliedFilters.maxPrice) params.append('maxPrice', appliedFilters.maxPrice);

      try {
        const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
        if (!response.ok) throw new Error('Could not load products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [appliedFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedFilters({
      keyword: keywordInput,
      category: categoryInput,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
    });
  };

  return (
    <div>
      <h1>Marketplace</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by keyword..."
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
        />

        <select value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}>
          <option value="">All categories</option>
          <option value="Books">Books</option>
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
          <option value="Clothing">Clothing</option>
          <option value="Stationery">Stationery</option>
          <option value="Sports">Sports</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="number"
          placeholder="Min price"
          value={minPriceInput}
          onChange={(e) => setMinPriceInput(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPriceInput}
          onChange={(e) => setMaxPriceInput(e.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading products...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && products.length === 0 && <p>No products found.</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {products.map((product) => (
          <div
            key={product._id}
            style={{ border: '1px solid #ccc', padding: '1rem', width: '200px' }}
          >
            <div style={{ background: '#eee', height: '120px' }}>No image</div>
            <h3>{product.title}</h3>
            <p>${product.price}</p>
            <p>{product.category}</p>
            <p>{product.availability}</p>
            <Link to={`/products/${product._id}`}>View</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marketplace;
