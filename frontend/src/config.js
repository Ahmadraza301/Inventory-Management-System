// API Configuration
const config = {
  development: {
    API_BASE_URL: 'http://localhost:8000',
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'https://your-backend-domain.com',
  }
};

const environment = process.env.NODE_ENV || 'development';

export default config[environment];