import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import SellerOrders from './pages/SellerOrders';
import CreateProduct from './pages/CreateProduct';
import MyProducts from './pages/MyProducts';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Marketplace />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/seller-orders" element={<SellerOrders />} />
        <Route path="/create-product" element={<CreateProduct />} />
        <Route path="/my-products" element={<MyProducts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
