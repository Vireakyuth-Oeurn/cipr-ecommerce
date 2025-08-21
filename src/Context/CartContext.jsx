// Update the cart context to handle the API response correctly

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContext } from './AppContext';
import { getCart } from '../api/services';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useContext(AppContext);

  // Calculate cart count whenever cartItems changes
  useEffect(() => {
    const newCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    setCartCount(newCount);
    console.log('🛒 Cart count updated:', newCount);
  }, [cartItems]);

  // Fetch cart when user logs in/out
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🛒 User authenticated, fetching cart...');
      fetchCart();
    } else {
      console.log('🛒 User not authenticated, clearing cart...');
      setCartItems([]);
      setCartCount(0);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      console.log('🛒 Cannot fetch cart: user not authenticated');
      return;
    }

    try {
      setLoading(true);
      console.log('🛒 Fetching cart data...');
      
      const response = await getCart();
      console.log('🛒 Cart response:', response);

      // Handle the enhanced cart response
      const items = response.items || [];
      console.log('🛒 Setting cart items:', items.length);
      
      setCartItems(items);

    } catch (error) {
      console.error('🛒 Failed to fetch cart:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.log('🛒 Authentication error, clearing cart');
        setCartItems([]);
        setCartCount(0);
      } else {
        // For other errors, keep existing cart state
        console.log('🛒 Network error, keeping existing cart state');
      }
    } finally {
      setLoading(false);
    }
  };

  const addItemToCart = (item) => {
    console.log('🛒 Adding item to local cart:', item);
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => 
        cartItem.productId === item.productId || cartItem.product_id === item.product_id
      );
      
      if (existingItem) {
        // Update quantity of existing item
        return prevItems.map(cartItem =>
          (cartItem.productId === item.productId || cartItem.product_id === item.product_id)
            ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
            : cartItem
        );
      } else {
        // Add new item
        return [...prevItems, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  const removeItemFromCart = (itemId) => {
    console.log('🛒 Removing item from local cart:', itemId);
    setCartItems(prevItems => prevItems.filter(item => 
      item.id !== itemId && item.cartItemId !== itemId
    ));
  };

  const updateItemQuantity = (itemId, quantity) => {
    console.log('🛒 Updating item quantity:', itemId, quantity);
    if (quantity <= 0) {
      removeItemFromCart(itemId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          (item.id === itemId || item.cartItemId === itemId)
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    console.log('🛒 Clearing cart');
    setCartItems([]);
    setCartCount(0);
  };

  const value = {
    cartItems,
    cartCount,
    loading,
    fetchCart,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
