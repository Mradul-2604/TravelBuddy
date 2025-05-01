import axiosInstance from '../utils/axiosConfig';

const API_URL = 'http://localhost:5000/api/auth/';

const register = async (username, email, password) => {
  const response = await axiosInstance.post(API_URL + 'register', {
    username,
    email,
    password,
  });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (email, password) => {
  const response = await axiosInstance.post(API_URL + 'login', {
    email,
    password,
  });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const refreshToken = async () => {
  const user = getCurrentUser();
  if (!user || !user.token) {
    throw new Error('No token found');
  }

  try {
    const response = await axiosInstance.post(API_URL + 'refresh-token', {
      token: user.token
    });
    
    if (response.data.token) {
      const updatedUser = { ...user, token: response.data.token };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
  } catch (error) {
    logout();
    throw error;
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
};

export default authService; 