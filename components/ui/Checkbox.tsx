import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  'aria-label'?: string;
  style?: ViewStyle;
}

export function Checkbox({ 
  checked, 
  onCheckedChange, 
  'aria-label': ariaLabel, 
  style 
}: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onCheckedChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityLabel={ariaLabel}
      accessibilityState={{ checked }}
      style={[styles.container, style]}>
      <ThemedView style={[
        styles.checkbox,
        checked && styles.checked
      ]}>
        {checked && (
          <Ionicons 
            name="checkmark" 
            size={16} 
            color="#FFFFFF"
          />
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
}); 