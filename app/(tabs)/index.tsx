import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, FlatList, Image, Pressable, ScrollView } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { recipeService } from '@/services/recipeService';
import { Checkbox } from '@/components/ui/Checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
}

interface CategoryItem {
  id: string;
  title: string;
  icon: string;
  color: string;
}

const categories: CategoryItem[] = [
  { id: '1', title: 'Breakfast', icon: '☕', color: '#FFD93D' },
  { id: '2', title: 'Lunch', icon: '🥗', color: '#6BCB77' },
  { id: '3', title: 'Dinner', icon: '🍕', color: '#FF6B6B' },
  { id: '4', title: 'Desserts', icon: '🍰', color: '#E384FF' },
  { id: '5', title: 'Quick & Easy', icon: '⏰', color: '#4D96FF' },
  { id: '6', title: 'Vegetarian', icon: '🥬', color: '#95CD41' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

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

  const searchRecipes = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await recipeService.searchRecipes({ query });
      if (!result.results || result.results.length === 0) {
        setError('No recipes found. Try a different search term.');
        return;
      }
      router.push({
        pathname: '/search-results',
        params: { 
          query,
          results: JSON.stringify(result.results)
        }
      });
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchRecipes(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const RecipeCard = ({ item }: { item: Recipe }) => (
    <Pressable 
      style={styles.recipeCard}
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
        <ThemedView style={styles.recipeHeader}>
          <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.recipeTitle}>
            {item.title}
          </ThemedText>
          <Checkbox
            checked={favorites.has(item.id)}
            onCheckedChange={() => toggleFavorite(item.id)}
            aria-label="Save recipe"
            style={styles.favoriteCheckbox}
          />
        </ThemedView>
        <ThemedText>
          {item.readyInMinutes} mins • {item.servings} servings
        </ThemedText>
      </ThemedView>
    </Pressable>
  );

  const CategoryCard = ({ item }: { item: CategoryItem }) => (
    <Pressable 
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => {
        router.push({
          pathname: '/search-results',
          params: { 
            query: item.title,
            category: item.id
          }
        });
      }}>
      <ThemedText style={styles.categoryIcon}>{item.icon}</ThemedText>
      <ThemedText style={styles.categoryTitle}>{item.title}</ThemedText>
    </Pressable>
  );

  return (
    <ScrollView
      style={styles.scrollView}
      stickyHeaderIndices={[0]}
    >
      <LinearGradient
        colors={['#FF6B6B', '#FFE66D']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <ThemedView style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Recipe App</ThemedText>
          <Pressable 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color="#1E293B" />
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.taglineContainer}>
          <ThemedText style={styles.taglineText}>
            Discover • Create • Savor
          </ThemedText>
          <ThemedText style={styles.quoteText}>
            "A recipe is a story that ends with a good meal"
          </ThemedText>
        </ThemedView>

        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </LinearGradient>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.categoriesContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Explore Categories
          </ThemedText>

          <FlatList
            key="categories-grid-3"
            data={categories}
            renderItem={({ item }) => <CategoryCard item={item} />}
            keyExtractor={item => item.id}
            numColumns={3}
            columnWrapperStyle={styles.categoryRow}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesGrid}
          />
        </ThemedView>

        {isLoading && (
          <ThemedText style={styles.statusText}>Loading recipes...</ThemedText>
        )}
        {error && (
          <ThemedText style={[styles.statusText, styles.errorText]}>{error}</ThemedText>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  content: {
    padding: 16,
  },
  header: {
    width: '100%',
    height: 200,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  headerImage: {
    height: 200,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  title: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 50,
    marginHorizontal: 20,
    marginTop: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingLeft: 25,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 20,
    textAlign: 'center',
    color: '#1E293B',
  },
  recipeRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recipeCard: {
    width: '48%',
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
    height: 120,
  },
  recipeInfo: {
    padding: 12,
  },
  headerGradient: {
    height: 200,
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  profileButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  taglineText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#1E293B',
    opacity: 0.9,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  categoryRow: {
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  categoryCard: {
    width: 110,
    height: 110,
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 5,
  },
  categoryIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  statusText: {
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#FF6B6B',
  },
  categoriesContainer: {
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  categoriesGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 25,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeTitle: {
    flex: 1,
    marginRight: 8,
  },
  favoriteCheckbox: {
    marginLeft: 'auto',
  },
});

