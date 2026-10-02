import NAVIGATION_STRINGS from '@/constants/navigationStrings';
import { useCallback } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '@/components/emptyState';
import { Screen } from '@/components/screen';
import { TaskListSkeleton } from '@/components/taskListSkeleton';
import type { AppStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { HomeHeader } from './components/homeHeader';
import { SelectedTaskRow } from './components/selectedTaskRow';
import { useHome } from './hooks/useHome';

type Props = NativeStackScreenProps<AppStackParamList, typeof NAVIGATION_STRINGS.HOME>;

export function HomeScreen({ navigation }: Props) {
  const {
    name,
    groups,
    profile,
    loading,
    refreshing,
    serverError,
    onRefresh,
    onRetry,
    onSignOut,
  } = useHome();

  const goToTasks = useCallback(() => navigation.navigate(NAVIGATION_STRINGS.TASKS), [navigation]);

  const renderSectionHeader = useCallback(({ section }: { section: { title: string } }) => (
    <Text style={styles.groupLabel}>{section.title}</Text>
  ), []);

  const renderItem = useCallback(({ item }: { item: any }) => <SelectedTaskRow task={item} />, []);

  const renderEmpty = useCallback(() => {
    if (serverError) {
      return (
        <EmptyState
          icon="alert-circle"
          title="Couldn't load your tasks"
          message={serverError.message}
          actionLabel="Try again"
          onAction={onRetry}
        />
      );
    }
    return (
      <EmptyState
        icon="check-square"
        title="No tasks selected yet"
        message="Tick the errands PadosiPro should look after and they will appear here."
        actionLabel="Choose tasks"
        onAction={goToTasks}
      />
    );
  }, [serverError, onRetry, goToTasks]);

  return (
    <Screen>
      <HomeHeader name={name} onSignOut={onSignOut} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Selected Tasks</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change selected tasks"
          hitSlop={8}
          onPress={goToTasks}
          testID="home-change-tasks"
        >
          <Text style={styles.sectionAction}>Change</Text>
        </Pressable>
      </View>

      {loading ? (
        <TaskListSkeleton rows={3} />
      ) : (
        <SectionList
          sections={groups}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyExtractor={(task) => task.id}
          stickySectionHeadersEnabled={false}
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typography.title, color: colors.text, marginBottom: spacing.md },
  sectionAction: { ...typography.bodyMedium, color: colors.primary },
  list: { flex: 1 },
  listContent: { paddingBottom: spacing.xxl, flexGrow: 1 },
  groupLabel: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
