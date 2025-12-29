import { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '@/src/theme';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  label: string;
  value: number;
  percentage: number;
}

interface AnalyticsCardProps {
  title: string;
  data: AnalyticsData[];
  type?: 'bar' | 'progress';
}

const BarChart = memo(function BarChart({ data }: { data: AnalyticsData[] }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <View style={styles.barChart}>
      {data.map((item, index) => (
        <View key={index} style={styles.barItem}>
          <View style={styles.barContainer}>
            <LinearGradient
              colors={[colors.primary, colors.violet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[
                styles.bar,
                { height: `${(item.value / maxValue) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.barLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
});

const ProgressChart = memo(function ProgressChart({ data }: { data: AnalyticsData[] }) {
  return (
    <View style={styles.progressChart}>
      {data.map((item, index) => (
        <View key={index} style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{item.label}</Text>
            <Text style={styles.progressValue}>₹{item.value.toLocaleString()}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[colors.primary, colors.violet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBar, { width: `${item.percentage}%` }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
});

export const AnalyticsCard = memo(function AnalyticsCard({
  title,
  data,
  type = 'bar',
}: AnalyticsCardProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#141414']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.iconContainer}>
            <Feather name="bar-chart-2" size={16} color={colors.primary} />
          </View>
        </View>
        {type === 'bar' ? (
          <BarChart data={data} />
        ) : (
          <ProgressChart data={data} />
        )}
      </LinearGradient>
    </View>
  );
});

interface QuickStatsProps {
  stats: Array<{
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value: string;
    change: string;
    isPositive: boolean;
  }>;
}

export const QuickStats = memo(function QuickStats({ stats }: QuickStatsProps) {
  return (
    <View style={styles.quickStatsContainer}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.quickStatItem}>
          <LinearGradient
            colors={['#1a1a1a', '#141414']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickStatGradient}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name={stat.icon} size={14} color={colors.primary} />
            </View>
            <Text style={styles.quickStatValue}>{stat.value}</Text>
            <Text style={styles.quickStatLabel}>{stat.label}</Text>
            <View style={[
              styles.changeBadge,
              { backgroundColor: stat.isPositive ? colors.emeraldLight : colors.redLight }
            ]}>
              <Feather
                name={stat.isPositive ? 'arrow-up-right' : 'arrow-down-right'}
                size={10}
                color={stat.isPositive ? colors.emerald : colors.red}
              />
              <Text style={[
                styles.changeText,
                { color: stat.isPositive ? colors.emerald : colors.red }
              ]}>
                {stat.change}
              </Text>
            </View>
          </LinearGradient>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  gradient: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barChart: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  barContainer: {
    width: '100%',
    height: 100,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: borderRadius.sm,
    minHeight: 8,
  },
  barLabel: {
    ...typography.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  progressChart: {
    gap: spacing.md,
  },
  progressItem: {
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  progressValue: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickStatItem: {
    width: (screenWidth - spacing.lg * 2 - spacing.md) / 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  quickStatGradient: {
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  quickStatValue: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  quickStatLabel: {
    ...typography.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  changeText: {
    ...typography.xs,
    fontWeight: '500',
    marginLeft: 2,
  },
});
