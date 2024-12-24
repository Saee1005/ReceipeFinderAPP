// Base configuration for the Spoonacular API
export const API_CONFIG = {
  BASE_URL: 'https://api.spoonacular.com',
  // Don't commit the actual API key to version control
  API_KEY: process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY || '48295a8774674097a19e3586969c2efb'
}; 