import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/">Marketplace</Link>

      {token && <Link to="/my-orders">My Orders</Link>}

      {token && (role === 'seller' || role === 'admin') && (
        <>
          <Link to="/my-products">My Products</Link>
          <Link to="/create-product">Sell an Item</Link>
          <Link to="/seller-orders">Orders on My Products</Link>
        </>
      )}

      <div style={{ marginLeft: 'auto' }}>
        {token ? (
          <>
            <span>Hi, {name}</span>{' '}
            <button onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log In</Link> <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
