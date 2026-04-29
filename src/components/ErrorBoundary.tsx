// To enable Sentry: run: npx expo install @sentry/react-native
/**
 * ErrorBoundary - Global error handling component
 * Catches JavaScript errors in child component tree and displays fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

const PRIMARY = '#135bec';
const BG_DARK = '#0a0a0a';
const SURFACE = '#1a1a1a';
const Sentry = (() => {
    try { return require('@sentry/react-native'); }
    catch { return { captureException: () => {}, captureMessage: () => {} }; }
})();

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });

        // Log error to console in development
        if (__DEV__) {
            console.error('[ErrorBoundary] Caught error:', error);
            console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
        }

        // Call optional error handler
        this.props.onError?.(error, errorInfo);

        // Report crash to Sentry so the team is notified when real users hit errors.
        Sentry.captureException(error, {
            contexts: { react: { componentStack: errorInfo.componentStack } },
        });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render(): ReactNode {
        const { hasError, error, errorInfo } = this.state;
        const { children, fallback } = this.props;

        if (hasError) {
            // Use custom fallback if provided
            if (fallback) {
                return fallback;
            }

            // Default error UI
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Feather name="alert-triangle" size={48} color={PRIMARY} />
                        </View>

                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.subtitle}>
                            We're sorry, but something unexpected happened. Please try again.
                        </Text>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={this.handleReset}
                            activeOpacity={0.8}
                        >
                            <Feather name="refresh-cw" size={18} color="#ffffff" />
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>

                        {__DEV__ && error && (
                            <ScrollView style={styles.debugContainer} showsVerticalScrollIndicator={false}>
                                <Text style={styles.debugTitle}>Debug Info</Text>
                                <Text style={styles.debugText}>
                                    {error.name}: {error.message}
                                </Text>
                                {errorInfo?.componentStack && (
                                    <Text style={styles.debugStack}>
                                        {errorInfo.componentStack.trim()}
                                    </Text>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            );
        }

        return children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_DARK,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        maxWidth: 320,
    },
    iconContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: 'rgba(19, 91, 236, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: PRIMARY,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        minWidth: 160,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    debugContainer: {
        marginTop: 32,
        padding: 16,
        backgroundColor: SURFACE,
        borderRadius: 12,
        maxHeight: 200,
        width: '100%',
    },
    debugTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    debugText: {
        fontSize: 12,
        color: '#ef4444',
        fontFamily: 'monospace',
        marginBottom: 8,
    },
    debugStack: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.4)',
        fontFamily: 'monospace',
    },
});

export default ErrorBoundary;
