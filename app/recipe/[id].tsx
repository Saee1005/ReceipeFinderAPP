import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { recipeService } from '@/services/recipeService';

interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  instructions: string;
  extendedIngredients: Array<{
    original: string;
    id: number;
  }>;
}

export default function RecipeDetails() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecipeDetails();
  }, [id]);

  const loadRecipeDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const details = await recipeService.getRecipeDetails(id as string);
      setRecipe(details);
    } catch (err) {
      setError('Failed to load recipe details. Please try again.');
      console.error('Error loading recipe details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </ThemedView>
    );
  }

  if (error || !recipe) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText style={styles.errorText}>{error || 'Recipe not found'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: recipe.image }} 
        style={styles.recipeImage} 
      />
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>{recipe.title}</ThemedText>
        
        <ThemedView style={styles.infoRow}>
          <ThemedText>🕒 {recipe.readyInMinutes} mins</ThemedText>
          <ThemedText>👥 {recipe.servings} servings</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>Ingredients</ThemedText>
        {recipe.extendedIngredients?.map((ingredient) => (
          <ThemedText key={ingredient.id} style={styles.ingredient}>
            • {ingredient.original}
          </ThemedText>
        ))}

        <ThemedText style={styles.sectionTitle}>Instructions</ThemedText>
        <ThemedText style={styles.instructions}>{recipe.instructions}</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  recipeImage: {
    width: '100%',
    height: 250,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 8,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
}); 