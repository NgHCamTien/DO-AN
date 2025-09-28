import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Kiểm tra nếu có thông tin đăng nhập trong localStorage
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user info:', error);
        localStorage.removeItem('userInfo');
      }
    }
    
    setLoading(false);
  }, []);
  
  // Hàm đăng nhập với API call
  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login with email:', email);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('AuthContext: Login response:', data);

      if (response.ok && data.success) {
        const userToSave = {
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || 'user',
          phone: data.user.phone || '',
          address: data.user.address || '',
          subscribedToNewsletter: data.user.subscribedToNewsletter,
          token: data.user.token
        };
        
        console.log('AuthContext: Login successful, saving user:', userToSave);
        setUser(userToSave);
        localStorage.setItem('userInfo', JSON.stringify(userToSave));
        
        return { success: true, user: userToSave, message: data.message };
      } else {
        console.error('AuthContext: Login failed:', data.message);
        return { success: false, message: data.message || 'Đăng nhập thất bại' };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { 
        success: false, 
        message: 'Lỗi kết nối. Vui lòng kiểm tra server có đang chạy không.' 
      };
    }
  };
  
  // Hàm register với newsletter support
  const register = async (name, email, password, phone = '', address = '', subscribeNewsletter = true) => {
    try {
      console.log('AuthContext: Attempting register with:', { 
        name, 
        email, 
        phone, 
        address, 
        subscribeNewsletter 
      });
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          phone, 
          address, 
          subscribeNewsletter 
        }),
      });

      const data = await response.json();
      console.log('AuthContext: Register response:', data);

      if (response.ok && data.success) {
        const userToSave = {
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || 'user',
          phone: data.user.phone || '',
          address: data.user.address || '',
          subscribedToNewsletter: data.user.subscribedToNewsletter,
          token: data.user.token
        };
        
        console.log('AuthContext: Register successful, saving user:', userToSave);
        setUser(userToSave);
        localStorage.setItem('userInfo', JSON.stringify(userToSave));
        
        return { success: true, user: userToSave, message: data.message };
      } else {
        console.error('AuthContext: Register failed:', data.message);
        return { success: false, message: data.message || 'Đăng ký thất bại' };
      }
    } catch (error) {
      console.error('AuthContext: Register error:', error);
      return { 
        success: false, 
        message: 'Lỗi kết nối. Vui lòng kiểm tra server có đang chạy không.' 
      };
    }
  };
  
  // Hàm cập nhật thông tin user
  const updateProfile = async (profileData) => {
    try {
      console.log('AuthContext: Updating profile:', profileData);
      
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      console.log('AuthContext: Update profile response:', data);

      if (response.ok && data.success) {
        const updatedUser = {
          ...user,
          ...data.user
        };
        
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser, message: data.message };
      } else {
        return { success: false, message: data.message || 'Cập nhật thất bại' };
      }
    } catch (error) {
      console.error('AuthContext: Update profile error:', error);
      return { 
        success: false, 
        message: 'Lỗi kết nối khi cập nhật thông tin.' 
      };
    }
  };
  
  // Hàm set user trực tiếp (dùng cho admin login hoặc các trường hợp khác)
  const setUserDirectly = (userData) => {
    console.log('AuthContext: Setting user directly:', userData);
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };
  
  // Đăng xuất
  const logout = () => {
    console.log('AuthContext: Logging out user');
    localStorage.removeItem('userInfo');
    setUser(null);
    window.location.href = '/';
  };
  
  // Kiểm tra nếu người dùng là admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        logout,
        isAdmin,
        setUser: setUserDirectly
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;