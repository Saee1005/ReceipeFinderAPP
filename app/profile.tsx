import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, Pressable, FlatList, ActivityIndicator, Button, Alert, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '@/types/recipe';
import { recipeService } from '@/services/recipeService';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '@/services/notificationService';
import { Notifications } from 'react-native';

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: 'Saee Mandavkar',
    email: 'Mandavkarsaee@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Saee+Mandavkar'
  });
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favoriteRecipes');
      if (savedFavorites) {
        const favoriteIds = JSON.parse(savedFavorites);
        const recipes = await Promise.all(
          favoriteIds.map((id: number) => recipeService.getRecipeDetails(id.toString()))
        );
        setSavedRecipes(recipes);
        
        const lastNotifiedRecipes = await AsyncStorage.getItem('lastNotifiedRecipes') || '[]';
        const lastNotifiedIds = new Set(JSON.parse(lastNotifiedRecipes));
        
        recipes.forEach(recipe => {
          if (!lastNotifiedIds.has(recipe.id)) {
            notificationService.sendSavedRecipeUpdateNotification(recipe.title);
          }
        });
        
        await AsyncStorage.setItem('lastNotifiedRecipes', JSON.stringify(favoriteIds));
      }
    } catch (err) {
      console.error('Error loading saved recipes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      const identifier = await notificationService.testImmediateNotification();
      if (identifier) {
        Alert.alert("Success", "Test notification sent!");
      } else {
        throw new Error("Failed to schedule notification");
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  const testScheduledNotification = async () => {
    try {
      const identifier = await notificationService.testScheduledNotification(5);
      if (identifier) {
        Alert.alert("Success", "Notification scheduled for 5 seconds from now");
      } else {
        throw new Error("Failed to schedule notification");
      }
    } catch (error) {
      console.error("Error scheduling test notification:", error);
      Alert.alert("Error", "Failed to schedule notification");
    }
  };

  const testDailyNotification = async () => {
    try {
      const identifier = await notificationService.scheduleDailyRecipeNotification();
      if (identifier) {
        Alert.alert("Success", "Daily notification scheduled");
      } else {
        throw new Error("Failed to schedule daily notification");
      }
    } catch (error) {
      console.error("Error scheduling daily notification:", error);
      Alert.alert("Error", "Failed to schedule daily notification");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Image 
          source={{ uri: user.avatar }}
          style={styles.avatar}
        />
        <ThemedText style={styles.name}>{user.name}</ThemedText>
        <ThemedText style={styles.email}>{user.email}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <Button 
          title="Test Notification" 
          onPress={testNotification}
          color="#FF6B6B"
        />
        <View style={{ height: 10 }} />
        <Button 
          title="Test Scheduled Notification" 
          onPress={testScheduledNotification}
          color="#FF6B6B"
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Saved Recipes</ThemedText>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF6B6B" />
        ) : savedRecipes.length > 0 ? (
          <FlatList
            data={savedRecipes}
            renderItem={({ item }) => (
              <Pressable
                style={styles.recipeCard}
                onPress={() => router.push({
                  pathname: '/recipe/[id]',
                  params: { id: item.id }
                })}
              >
                <Image 
                  source={{ uri: item.image }}
                  style={styles.recipeImage}
                />
                <ThemedView style={styles.recipeInfo}>
                  <ThemedText style={styles.recipeTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.recipeDetails}>
                    {item.readyInMinutes} mins • {item.servings} servings
                  </ThemedText>
                </ThemedView>
              </Pressable>
            )}
            keyExtractor={item => item.id.toString()}
          />
        ) : (
          <ThemedText style={styles.noRecipes}>
            No saved recipes yet
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Notification Testing</ThemedText>
        <View style={styles.buttonContainer}>
          <Button 
            title="Test Immediate" 
            onPress={testNotification}
            color="#FF6B6B"
          />
          <View style={{ height: 10 }} />
          <Button 
            title="Test 5s Delay" 
            onPress={testScheduledNotification}
            color="#FF6B6B"
          />
          <View style={{ height: 10 }} />
          <Button 
            title="Test Daily" 
            onPress={testDailyNotification}
            color="#FF6B6B"
          />
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recipeDetails: {
    fontSize: 14,
    color: '#666',
  },
  noRecipes: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  buttonContainer: {
    gap: 10,
    marginTop: 10,
  },
}); 