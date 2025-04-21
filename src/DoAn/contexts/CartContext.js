// CartContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext'; // Import your useUser hook

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { customerUser} = useUser();  // Access both admin and customer users from UserContext

  const [cart, setCart] = useState([]);

  // Get user's email
  const userEmail = customerUser ? customerUser.email : null;

  useEffect(() => {
    const fetchCart = async () => {
      if (userEmail) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/cart?email=${userEmail}`);
          const cartItems = response.data;

          // Fetch product details for each item in the cart
          const productDetailsPromises = cartItems.map(async (item) => {
            const productResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/san-pham/${item.product_id}`);
            return {
              ...item,
              ...productResponse.data, // Merge product details with cart item
            };
          });

          const cartWithProductDetails = await Promise.all(productDetailsPromises);
          setCart(cartWithProductDetails);
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      }
    };
    fetchCart();
  }, [userEmail]);  

  const addToCart = async (product) => {
    if (!userEmail) {
      console.error('User is not logged in');
      return; // Prevent adding to cart if user is not logged in
    }
    try {
      const existingProduct = cart.find(item => item.product_id === product.id);
      if (existingProduct) {
        await increaseQuantity(existingProduct.product_id); // Increase quantity if product already exists
      } else {
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/cart`, {
          email: userEmail, // Send user's email
          product_id: product.id,
          quantity: 1
        });
  
        // Update cart with new product directly without fetching again
        const newProduct = {
          ...response.data,
          ...product // You can merge product details if necessary
        };
        setCart(prevCart => [...prevCart, newProduct]); // Update cart with new product
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Function to remove product from cart
  const removeFromCart = async (productId) => {
    // Ask for confirmation before removing the item
    const confirmed = window.confirm("Bạn có chắc muốn xoá sản phẩm này khỏi giỏ hàng không?");
    
    if (!confirmed) {
      return; // If user cancels, exit the function
    }
  
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/cart/${userEmail}/${productId}`);
      setCart(cart.filter(item => item.product_id !== productId)); // Update cart after removal
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };
  

  // Function to increase product quantity
  const increaseQuantity = async (productId) => {
    try {
      const updatedCart = cart.map(item =>
        item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updatedCart);
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/cart/${userEmail}/${productId}`, {
        quantity: updatedCart.find(item => item.product_id === productId).quantity
      });
    } catch (error) {
      console.error('Error increasing quantity:', error);
    }
  };

  // Function to decrease product quantity
  const decreaseQuantity = async (productId) => {
    try {
      const item = cart.find(item => item.product_id === productId);
      if (item && item.quantity > 1) {
        const updatedCart = cart.map(item =>
          item.product_id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
        setCart(updatedCart);
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/cart/${userEmail}/${productId}`, {
          quantity: updatedCart.find(item => item.product_id === productId).quantity
        });
      } else {
        // If only 1 left, remove product
        await removeFromCart(productId);
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    }
  };

  // Function to clear the cart
  const clearCart = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/cart/${userEmail}`);
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for using CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
