import ENDPOINTS, { fetchData } from '../data/api';

const AuthModel = {
  async registerUser(data) {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
    return await fetchData(ENDPOINTS.REGISTER, options);
  },

  async loginUser(data) {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };

    const response = await fetchData(ENDPOINTS.LOGIN, options);

    if (response && response.token) {
      localStorage.setItem('authToken', response.token);
    }

    return response;
  },
};

export default AuthModel;
