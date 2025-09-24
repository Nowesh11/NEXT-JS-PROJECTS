'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Context
const CartContext = createContext();

// Cart Actions
const CART_ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_TO_CART: {
      const { book } = action.payload;
      const existingItem = state.items.find(item => item.id === book.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === book.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [
            ...state.items,
            {
              id: book.id,
              title: book.title,
              titleTamil: book.titleTamil,
              author: book.author,
              authorTamil: book.authorTamil,
              price: book.price,
              image: book.image,
              quantity: 1
            }
          ]
        };
      }
    }
    
    case CART_ACTIONS.REMOVE_FROM_CART: {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };
    }
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== id)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id
            ? { ...item, quantity }
            : item
        )
      };
    }
    
    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: []
      };
    }
    
    case CART_ACTIONS.LOAD_CART: {
      return {
        ...state,
        items: action.payload.items || []
      };
    }
    
    default:
      return state;
  }
};

// Initial State
const initialState = {
  items: [],
  sessionId: null
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Generate session ID
  const getSessionId = () => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('cart_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('cart_session_id', sessionId);
      }
      return sessionId;
    }
    return null;
  };
  
  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('tamil_society_cart');
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: { items: cartData }
          });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tamil_society_cart', JSON.stringify(state.items));
    }
  }, [state.items]);
  
  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };
  
  // API Base URL
  const getApiBaseUrl = () => {
    return typeof window !== 'undefined' && window.TLS_API_BASE_URL 
      ? window.TLS_API_BASE_URL 
      : 'http://localhost:8080';
  };
  
  // Add to cart with API integration
  const addToCart = async (book) => {
    try {
      const sessionId = getSessionId();
      const token = getAuthToken();
      
      // Try API first
      const response = await fetch(`${getApiBaseUrl()}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          bookId: book.id,
          quantity: 1
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.items) {
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: { items: result.data.items }
          });
          return { success: true, message: 'Added to cart successfully' };
        }
      }
      
      // Fallback to local storage
      throw new Error('API failed, using local storage');
      
    } catch (error) {
      console.log('Using local cart storage:', error.message);
      
      // Local fallback
      dispatch({
        type: CART_ACTIONS.ADD_TO_CART,
        payload: { book }
      });
      
      return { success: true, message: 'Added to cart successfully' };
    }
  };
  
  // Remove from cart
  const removeFromCart = async (id) => {
    try {
      const sessionId = getSessionId();
      const token = getAuthToken();
      
      // Try API first
      const response = await fetch(`${getApiBaseUrl()}/api/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({ bookId: id })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: { items: result.data?.items || [] }
          });
          return;
        }
      }
      
      throw new Error('API failed, using local storage');
      
    } catch (error) {
      console.log('Using local cart storage:', error.message);
      
      // Local fallback
      dispatch({
        type: CART_ACTIONS.REMOVE_FROM_CART,
        payload: { id }
      });
    }
  };
  
  // Update quantity
  const updateQuantity = async (id, quantity) => {
    try {
      const sessionId = getSessionId();
      const token = getAuthToken();
      
      // Try API first
      const response = await fetch(`${getApiBaseUrl()}/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          bookId: id,
          quantity: quantity
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: { items: result.data?.items || [] }
          });
          return;
        }
      }
      
      throw new Error('API failed, using local storage');
      
    } catch (error) {
      console.log('Using local cart storage:', error.message);
      
      // Local fallback
      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY,
        payload: { id, quantity }
      });
    }
  };
  
  // Clear cart
  const clearCart = async () => {
    try {
      const sessionId = getSessionId();
      const token = getAuthToken();
      
      // Try API first
      const response = await fetch(`${getApiBaseUrl()}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Session-ID': sessionId
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          dispatch({ type: CART_ACTIONS.CLEAR_CART });
          return;
        }
      }
      
      throw new Error('API failed, using local storage');
      
    } catch (error) {
      console.log('Using local cart storage:', error.message);
      
      // Local fallback
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  };
  
  // Get cart total
  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };
  
  // Get cart count
  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };
  
  // Get cart items
  const getCartItems = () => {
    return state.items;
  };
  
  // Checkout function
  const checkout = async (formData) => {
    try {
      const sessionId = getSessionId();
      const token = getAuthToken();
      
      const response = await fetch(`${getApiBaseUrl()}/api/cart/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          items: state.items,
          customerInfo: formData,
          total: getCartTotal()
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        return { success: true, orderId: result.orderId };
      } else {
        throw new Error(result.message || 'Checkout failed');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      return { success: false, message: error.message };
    }
  };
  
  const value = {
    cart: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getCartItems,
    checkout
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;