import NAVIGATION_STRINGS from '@/constants/navigationStrings';
import { useCallback } from 'react';
import { SectionList, StyleSheet, View, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/button';
import { Header } from '@/components/header';
import { EmptyState } from '@/components/emptyState';
import { Screen } from '@/components/screen';
import { SearchBar } from '@/components/searchBar';
import { TaskListSkeleton } from '@/components/taskListSkeleton';
import type { AppStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { CategorySection } from './components/categorySection';
import { TaskCard } from './components/taskCard';
import { useTasks } from './hooks/useTasks';

type Props = NativeStackScreenProps<AppStackParamList, typeof NAVIGATION_STRINGS.TASKS>;

export function TasksScreen({ navigation }: Props) {
  const {
    sections,
    search,
    selectedCount,
    loading,
    refreshing,
    submitting,
    serverError,
    hasNoMatches,
    isSelected,
    onChangeSearch,
    onRefresh,
    onRetry,
    onConfirm,
    onToggleTask,
  } = useTasks(navigation);

  const renderSectionHeader = useCallback(({ section }: { section: { title: string; data: any[] } }) => (
    <CategorySection title={section.title} count={section.data.length} />
  ), []);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TaskCard task={item} selected={isSelected(item.id)} onPress={onToggleTask} />
  ), [isSelected, onToggleTask]);

  const renderEmpty = useCallback(() => {
    if (serverError) {
      return (
        <EmptyState
          icon="alert-circle"
          title="Couldn't load tasks"
          message={serverError.message}
          actionLabel="Try again"
          onAction={onRetry}
        />
      );
    }
    if (hasNoMatches) {
      return (
        <EmptyState
          icon="search"
          title="No tasks match your search"
          message="Try a shorter word, or clear the search to see the full list."
        />
      );
    }
    return null;
  }, [serverError, hasNoMatches, onRetry]);

  return (
    <Screen
      padded={false}
      footer={
        <View style={styles.footer}>
          <Button
            label={`Confirm Selection (${selectedCount})`}
            onPress={onConfirm}
            loading={submitting}
            disabled={selectedCount === 0}
            testID="confirm-selection"
          />
        </View>
      }
    >
      <View style={styles.header}>
        <Header
          title="Choose your tasks"
          subtitle="Tick everything PadosiPro will manage for you, then confirm."
        />
        <SearchBar
          value={search}
          onChangeText={onChangeSearch}
          placeholder="Search tasks or categories"
        />
      </View>

      {loading ? (
        <View style={styles.skeleton}>
          <TaskListSkeleton rows={5} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyExtractor={(task) => task.id}
          stickySectionHeadersEnabled={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  skeleton: { paddingHorizontal: spacing.xl },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, flexGrow: 1 },
  footer: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
  },
});
