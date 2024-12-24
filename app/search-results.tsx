import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, FlatList, ActivityIndicator, Pressable, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Recipe } from '@/types/recipe';
import { useState, useEffect } from 'react';
import { recipeService } from '@/services/recipeService';
import { Checkbox } from '@/components/ui/Checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchResults() {
  const { query, category, results: initialResults } = useLocalSearchParams();
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (initialResults) {
      // If results were passed directly, use those
      setSearchResults(JSON.parse(initialResults as string));
      setIsLoading(false);
    } else if (query) {
      // Otherwise fetch results using the query
      fetchResults();
    }
  }, [query, category, initialResults]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favoriteRecipes');
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const toggleFavorite = async (recipeId: number) => {
    try {
      const newFavorites = new Set(favorites);
      if (newFavorites.has(recipeId)) {
        newFavorites.delete(recipeId);
      } else {
        newFavorites.add(recipeId);
      }
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favoriteRecipes', JSON.stringify([...newFavorites]));
    } catch (err) {
      console.error('Error saving favorite:', err);
    }
  };

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await recipeService.searchRecipes({ 
        query: query as string,
        ...(category && { cuisine: category }) 
      });
      if (!result.results || result.results.length === 0) {
        setError('No recipes found');
      } else {
        setSearchResults(result.results);
      }
    } catch (err) {
      setError('Failed to fetch recipes');
      console.error(err);
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

  if (error || searchResults.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.noResults}>
          {error || `No recipes found for "${query}"`}
        </ThemedText>
      </ThemedView>
    );
  }

  const numColumns = 2;

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.searchTitle}>
        Search Results for "{query}"
      </ThemedText>
      <FlatList
        data={searchResults}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.recipeCard, styles.gridItem]}
            onPress={() => router.push({
              pathname: '/recipe/[id]',
              params: { id: item.id }
            })}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.recipeImage}
              resizeMode="cover"
            />
            <ThemedView style={styles.recipeInfo}>
              <ThemedView style={styles.titleRow}>
                <ThemedText 
                  style={[styles.recipeTitle, { flex: 1 }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </ThemedText>
                <Checkbox
                  checked={favorites.has(item.id)}
                  onCheckedChange={() => toggleFavorite(item.id)}
                  aria-label={`Save ${item.title}`}
                  style={styles.favoriteCheckbox}
                />
              </ThemedView>
              <ThemedText style={styles.recipeSubtitle}>
                {item.readyInMinutes} mins • {item.servings} servings
              </ThemedText>
            </ThemedView>
          </Pressable>
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.resultsList}
        columnWrapperStyle={styles.row}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFBEB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  resultsList: {
    paddingVertical: 8,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 150,
  },
  recipeInfo: {
    padding: 8,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  gridItem: {
    flex: 1,
    margin: 8,
    maxWidth: '47%',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  favoriteCheckbox: {
    marginLeft: 8,
    transform: [{ scale: 0.8 }], // Make checkbox slightly smaller
  },
}); 