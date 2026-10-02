import { Pressable, StyleSheet, View } from 'react-native';
import { TextField } from '@/components/textField';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { input } from '@/theme/styles';
import { typography, SIZES } from '@/theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  testID?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search tasks', testID }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextField
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        left={<Feather name="search" size={SIZES.font18} color={colors.textSubtle} />}
        right={
          value.length > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} onPress={() => onChangeText('')}>
              <Feather name="x" size={SIZES.font18} color={colors.textSubtle} />
            </Pressable>
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
});
