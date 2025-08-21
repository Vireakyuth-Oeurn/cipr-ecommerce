import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';
import { purchaseProducts } from '../api/services';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useCart } from '../hooks/useCart';
import { showToast } from '../components/ui/simple-toast';

const Cart = () => {
  const { handleError } = useErrorHandler();
  const { 
    cartItems, 
    loading, 
    fetchCart, 
    updateItemQuantity, 
    removeItemFromCart 
  } = useCart();

  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState('');
  const [loadingQuantity, setLoadingQuantity] = useState(null);
  const [loadingRemove, setLoadingRemove] = useState(null);

  // Cart items come from context, no need to fetch separately
  useEffect(() => {
    // Context will handle fetching
  }, []);

  const handlePurchase = async () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }

    try {
      setPurchasing(true);
      setSuccess('');
      
      // Extract cart IDs
      const cartIds = cartItems.map(item => item.id);
      
      await purchaseProducts(cartIds);
      setSuccess('Purchase completed successfully!');
      showToast('Purchase completed successfully!', 'success');
      
      // Refresh cart after purchase
      setTimeout(() => {
        fetchCart();
        setSuccess('');
      }, 2000);
    } catch (err) {
      handleError(err, {
        fallbackMessage: 'Purchase failed. Please try again.',
        showToast: true,
        context: 'purchase'
      });
    } finally {
      setPurchasing(false);
    }
  };

  const subtotal = cartItems.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
  const shipping = cartItems.length > 0 ? 50 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const updateQuantity = async (id, newQuantity) => {
    try {
      const updatedQuantity = Math.max(1, newQuantity);
      setLoadingQuantity(id);
      
      // Use context method which handles API call and state update
      await updateItemQuantity(id, updatedQuantity);
      showToast(`Quantity updated to ${updatedQuantity}`, 'success');
      
    } catch (err) {
      handleError(err, {
        fallbackMessage: 'Failed to update quantity. Please try again.',
        showToast: true,
        context: 'update_quantity'
      });
    } finally {
      setLoadingQuantity(null);
    }
  };

  const removeItem = async (id) => {
    try {
      setLoadingRemove(id);
      
      // Use context method which handles API call and state update
      await removeItemFromCart(id);
      showToast('Item removed from cart', 'success');
      
    } catch (err) {
      handleError(err, {
        fallbackMessage: 'Failed to remove item. Please try again.',
        showToast: true,
        context: 'remove_item'
      });
    } finally {
      setLoadingRemove(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some items to get started</p>
            <div className="space-x-4">
              <a
                href="/products"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Cart Items</h2>
                
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'}
                          alt={item.product_name || item.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.product_name || item.name || `Product ${item.product_id}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.color && `Color: ${item.color}`} 
                          {item.size && ` • Size: ${item.size}`}
                        </p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">${item.price || 0}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={loadingQuantity === item.id}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loadingQuantity === item.id}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={loadingRemove === item.id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                      >
                        {loadingRemove === item.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePurchase}
                  disabled={purchasing || cartItems.length === 0}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? 'Processing...' : 'Proceed to Checkout'}
                </button>
                
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full border border-gray-300 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
