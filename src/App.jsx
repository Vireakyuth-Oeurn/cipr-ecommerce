// App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layout/MainLayout';
import Home from './pages/home';
import Products from './pages/products';
import ProductDetail from './pages/product-detail';
import Collections from './pages/collections';
import NotFoundPage from './pages/notfound';
import New from './pages/new';
import Cart from './pages/cart';
import { SimpleToaster } from './components/ui/simple-toaster';
import LoginPage from './components/auth/login';
import RegisterPage from './components/auth/register';
import { AppContext } from './context/AppContext';
import CartProvider from './context/CartContext';

function App() {
    const {user} = useContext(AppContext);

  return (
    <ErrorBoundary>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Routes under the main layout */}
              <Route path="/login" element={user ? <Home/> : <LoginPage />} />
              <Route path="/register" element={user ? <Home/> : <RegisterPage />} />
              <Route element={<MainLayout />}>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/new" element={<New />} />
                <Route path="/cart" element={<Cart />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <SimpleToaster />
          </div>
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
