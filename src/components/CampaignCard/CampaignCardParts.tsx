/**
 * CampaignCard Sub-Components
 * Extracted presentational components for CampaignCard
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { borderRadius, spacing, typography } from '@/src/theme';
import { getStatusBadgeConfig, StatusBadgeConfig } from '@/src/utils/campaignStatus';

// ─────────────────────────────────────────────────────────────────────────────
// Platform Icon
// ─────────────────────────────────────────────────────────────────────────────

interface PlatformIconProps {
    platform: string;
    size?: number;
}

export const PlatformIcon = memo(function PlatformIcon({ platform, size = 18 }: PlatformIconProps) {
    switch (platform) {
        case 'facebook':
            return (
                <View style={[styles.platformIconCircle, { backgroundColor: '#1877F2' }]}>
                    <Text style={{ color: '#fff', fontSize: size * 0.6, fontWeight: '700' }}>f</Text>
                </View>
            );
        case 'youtube':
            return (
                <View style={[styles.platformIconCircle, { backgroundColor: '#FF0000' }]}>
                    <Feather name="play" size={size * 0.5} color="#fff" />
                </View>
            );
        case 'instagram':
            return (
                <View style={[styles.platformIconCircle, { backgroundColor: '#E4405F' }]}>
                    <Feather name="instagram" size={size * 0.6} color="#fff" />
                </View>
            );
        case 'linkedin':
            return (
                <View style={[styles.platformIconCircle, { backgroundColor: '#0A66C2' }]}>
                    <Text style={{ color: '#fff', fontSize: size * 0.5, fontWeight: '700' }}>in</Text>
                </View>
            );
        default:
            return null;
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Status Badge
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignStatusBadgeProps {
    userState?: string;
    campaignStatus: string;
    primaryColor?: string;
}

export const CampaignStatusBadge = memo(function CampaignStatusBadge({
    userState,
    campaignStatus,
    primaryColor = '#1337EC',
}: CampaignStatusBadgeProps) {
    const config = getStatusBadgeConfig(
        userState as any,
        campaignStatus as any,
        primaryColor
    );

    return (
        <View style={[styles.statusBadge, { backgroundColor: config.backgroundColor }]}>
            <Feather
                name={config.iconName}
                size={14}
                color={config.textColor}
                style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusText, { color: config.textColor }]}>
                {config.label}
            </Text>
        </View>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Metrics Row
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignMetricsRowProps {
    ageGroup: string;
    followersRange: string;
    gender: string;
    textMuted: string;
    textPrimary: string;
}

export const CampaignMetricsRow = memo(function CampaignMetricsRow({
    ageGroup,
    followersRange,
    gender,
    textMuted,
    textPrimary,
}: CampaignMetricsRowProps) {
    return (
        <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: textMuted }]}>Age group</Text>
                <Text style={[styles.statValue, { color: textPrimary }]}>{ageGroup}</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: textMuted }]}>Followers range</Text>
                <Text style={[styles.statValue, { color: textPrimary }]}>{followersRange}</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: textMuted }]}>Gender</Text>
                <Text style={[styles.statValue, { color: textPrimary }]}>{gender}</Text>
            </View>
        </View>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Brand Header
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignBrandHeaderProps {
    brandName: string;
    brandLogo?: string;
    title: string;
    tags: string[];
    contentTypes: string[];
    platforms: string[];
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    tagBg: string;
    tagBorder: string;
    primaryColor: string;
    onShare?: () => void;
}

export const CampaignBrandHeader = memo(function CampaignBrandHeader({
    brandName,
    brandLogo,
    title,
    tags,
    contentTypes,
    platforms,
    textPrimary,
    textSecondary,
    textMuted,
    tagBg,
    tagBorder,
    primaryColor,
    onShare,
}: CampaignBrandHeaderProps) {
    return (
        <View style={styles.topRight}>
            <View style={styles.brandRow}>
                <View style={styles.brandInfo}>
                    {brandLogo ? (
                        <Image source={{ uri: brandLogo }} style={styles.brandLogo} />
                    ) : (
                        <View style={[styles.brandLogo, { backgroundColor: primaryColor + '20' }]}>
                            <Feather name="briefcase" size={12} color={primaryColor} />
                        </View>
                    )}
                    <Text style={[styles.brandName, { color: textSecondary }]} numberOfLines={1}>
                        {brandName}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.shareBtn, { borderColor: tagBorder }]}
                    onPress={onShare}
                >
                    <Feather name="share-2" size={16} color={textSecondary} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.title, { color: textPrimary }]} numberOfLines={2}>
                {title}
            </Text>

            <View style={styles.tagsRow}>
                {tags.slice(0, 2).map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: tagBg, borderColor: tagBorder }]}>
                        <Text style={[styles.tagText, { color: textSecondary }]}>{tag}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.contentRow}>
                <Text style={[styles.contentText, { color: textMuted }]}>
                    {contentTypes.join(' | ')}
                </Text>
                <View style={styles.platformIcons}>
                    {platforms.map((p, i) => (
                        <View key={i} style={i > 0 ? { marginLeft: -4 } : undefined}>
                            <PlatformIcon platform={p} />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Campaign CTA (Apply Button or Status Badge)
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignCTAProps {
    showApply: boolean;
    showStatus: boolean;
    userState?: string;
    campaignStatus: string;
    primaryColor: string;
    onApply?: () => void;
}

export const CampaignCTA = memo(function CampaignCTA({
    showApply,
    showStatus,
    userState,
    campaignStatus,
    primaryColor,
    onApply,
}: CampaignCTAProps) {
    if (showApply) {
        return (
            <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: '#FFC107' }]}
                onPress={onApply}
            >
                <Text style={[styles.applyBtnText, { color: '#1a1a1a' }]}>Apply</Text>
                <Feather name="arrow-right" size={16} color="#1a1a1a" />
            </TouchableOpacity>
        );
    }

    if (showStatus) {
        return (
            <CampaignStatusBadge
                userState={userState}
                campaignStatus={campaignStatus}
                primaryColor={primaryColor}
            />
        );
    }

    return null;
});

// ─────────────────────────────────────────────────────────────────────────────
// Styles (shared across sub-components)
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    platformIconCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topRight: {
        flex: 1,
    },
    brandRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    brandInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    brandLogo: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandName: {
        ...typography.small,
        fontSize: 13,
    },
    shareBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...typography.bodyMedium,
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        marginBottom: spacing.sm,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.sm,
        flexWrap: 'wrap',
    },
    tag: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
    },
    tagText: {
        ...typography.xs,
        fontSize: 11,
    },
    contentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contentText: {
        ...typography.small,
        fontSize: 13,
    },
    platformIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        ...typography.xs,
        fontSize: 11,
        marginBottom: 2,
    },
    statValue: {
        ...typography.bodyMedium,
        fontSize: 14,
        fontWeight: '500',
    },
    applyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
    },
    applyBtnText: {
        ...typography.bodyMedium,
        fontSize: 14,
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: borderRadius.full,
    },
    statusText: {
        ...typography.small,
        fontSize: 13,
        fontWeight: '500',
    },
});
