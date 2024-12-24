import { API_CONFIG } from '@/config/api';

interface SearchRecipesParams {
  query: string;
  offset?: number;
  number?: number;
}

export const recipeService = {
  async searchRecipes({ query, offset = 0, number = 10 }: SearchRecipesParams) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/recipes/complexSearch?apiKey=${API_CONFIG.API_KEY}&query=${encodeURIComponent(
          query
        )}&offset=${offset}&number=${number}`
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
  },

  async getRecipeDetails(id: string) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/recipes/${id}/information?apiKey=${API_CONFIG.API_KEY}`
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      throw error;
    }
  }
}; 