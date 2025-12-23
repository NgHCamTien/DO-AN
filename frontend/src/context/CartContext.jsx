import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  
  // Danh sách mã giảm giá có sẵn
  const availableCoupons = {
    'WELCOME15': {
      code: 'WELCOME15',
      discount: 15, // 15%
      type: 'percentage',
      minOrder: 200000, // Tối thiểu 200k
      maxDiscount: 100000, // Tối đa giảm 100k
      description: 'Giảm 15% cho đơn hàng đầu tiên',
      isActive: true
    },
    'SUMMER20': {
      code: 'SUMMER20',
      discount: 20,
      type: 'percentage',
      minOrder: 500000,
      maxDiscount: 200000,
      description: 'Giảm 20% đơn hàng mùa hè',
      isActive: true
    },
    'SAVE50K': {
      code: 'SAVE50K',
      discount: 50000,
      type: 'fixed',
      minOrder: 300000,
      maxDiscount: 50000,
      description: 'Giảm 50k cho đơn từ 300k',
      isActive: true
    }
  };
  
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    const storedCoupon = localStorage.getItem('appliedCoupon');
    
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart items:', error);
        localStorage.removeItem('cartItems');
      }
    }
    
    if (storedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(storedCoupon));
      } catch (error) {
        console.error('Error parsing coupon:', error);
        localStorage.removeItem('appliedCoupon');
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);
  
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [appliedCoupon]);
  
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += product.quantity;
        return updatedItems;
      } else {
        return [...prevItems, product];
      }
    });
  };
  
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };
  
  const removeFromCart = (productId) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item._id !== productId)
    );
  };
  
  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponError('');
  };
  
  // Tính tổng tiền trước khi giảm giá
  const getCartSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };
  
  // Áp dụng mã giảm giá
  const applyCoupon = async (couponCode) => {
    setCouponError('');
    
    if (!couponCode || !couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return false;
    }
    
    try {
      // Gọi API validate từ backend
      const response = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          orderAmount: getCartSubtotal()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponError('');
        return true;
      } else {
        setCouponError(data.message);
        return false;
      }
      
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Lỗi kết nối server. Vui lòng thử lại.');
      return false;
    }
  };
  
  // Xóa mã giảm giá
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };
  
  // Tính số tiền giảm giá
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    
    // Sử dụng discountAmount từ server
    return appliedCoupon.discountAmount || 0;
  };
  
  // Tính tổng tiền cuối cùng (sau khi giảm giá)
  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const discountAmount = getDiscountAmount();
    return Math.max(0, subtotal - discountAmount);
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        appliedCoupon,
        couponError,
        availableCoupons,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        getCartSubtotal,
        getCartTotal,
        getDiscountAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;