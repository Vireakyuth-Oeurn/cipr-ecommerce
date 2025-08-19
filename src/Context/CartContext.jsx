import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart } from '../api/services';
import { AppContext } from '../Context/AppContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useContext(AppContext);

  // Calculate cart count whenever cart items change
  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartCount(count);
  }, [cartItems]);

  const fetchCart = useCallback(async () => {
    if (import.meta.env.DEV) {
      console.log('CartContext fetchCart called, isAuthenticated:', isAuthenticated);
    }
    
    if (!isAuthenticated) {
      setCartItems([]);
      // Let useEffect handle count calculation
      return;
    }
    
    try {
      setLoading(true);
      const response = await getCart();
      
      if (import.meta.env.DEV) {
        console.log('CartContext fetchCart response:', response);
      }
      
      const items = response.cart || response.items || response || [];
      const validItems = Array.isArray(items) ? items : [];
      
      if (import.meta.env.DEV) {
        console.log('CartContext setting items:', validItems);
      }
      
      setCartItems(validItems);
      // Let useEffect calculate the count based on quantities
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch cart:', error);
      }
      
      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // User might have been logged out
        setCartItems([]);
        // Let useEffect handle count calculation
      } else {
        // Other errors - still reset cart to prevent UI issues
        setCartItems([]);
        // Let useEffect handle count calculation
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setCartItems([]);
      // Let useEffect handle count calculation
    }
  }, [isAuthenticated, fetchCart]);

  const addItemToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + (item.quantity || 1) }
            : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  const removeItemFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItemFromCart(itemId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    // Let useEffect handle count calculation
  };

  const value = {
    cartItems,
    cartCount,
    loading,
    fetchCart,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export { CartContext };
export default CartProvider;
