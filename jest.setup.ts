/**
 * Jest setup file
 * Mocks for expo-router, AsyncStorage, SecureStore, Supabase, and network
 */

import '@testing-library/react-native/extend-expect';

// ─────────────────────────────────────────────────────────────────────────────
// Mock expo-router
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        canGoBack: jest.fn(() => false),
    }),
    useSegments: () => [],
    useLocalSearchParams: () => ({}),
    Link: ({ children }: { children: React.ReactNode }) => children,
    Slot: ({ children }: { children: React.ReactNode }) => children,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock AsyncStorage
// ─────────────────────────────────────────────────────────────────────────────

const mockAsyncStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn((key: string, value: string) => {
        mockAsyncStorage[key] = value;
        return Promise.resolve();
    }),
    getItem: jest.fn((key: string) => {
        return Promise.resolve(mockAsyncStorage[key] || null);
    }),
    removeItem: jest.fn((key: string) => {
        delete mockAsyncStorage[key];
        return Promise.resolve();
    }),
    clear: jest.fn(() => {
        Object.keys(mockAsyncStorage).forEach((key) => delete mockAsyncStorage[key]);
        return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockAsyncStorage))),
    multiGet: jest.fn((keys: string[]) =>
        Promise.resolve(keys.map((key) => [key, mockAsyncStorage[key] || null]))
    ),
    multiSet: jest.fn((pairs: [string, string][]) => {
        pairs.forEach(([key, value]) => {
            mockAsyncStorage[key] = value;
        });
        return Promise.resolve();
    }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock expo-secure-store
// ─────────────────────────────────────────────────────────────────────────────

const mockSecureStore: Record<string, string> = {};

jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn((key: string, value: string) => {
        mockSecureStore[key] = value;
        return Promise.resolve();
    }),
    getItemAsync: jest.fn((key: string) => {
        return Promise.resolve(mockSecureStore[key] || null);
    }),
    deleteItemAsync: jest.fn((key: string) => {
        delete mockSecureStore[key];
        return Promise.resolve();
    }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock Supabase
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        auth: {
            getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
            signInWithOtp: jest.fn(() => Promise.resolve({ data: {}, error: null })),
            signOut: jest.fn(() => Promise.resolve({ error: null })),
            onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({ data: [], error: null })),
            insert: jest.fn(() => ({ data: null, error: null })),
            update: jest.fn(() => ({ data: null, error: null })),
            delete: jest.fn(() => ({ data: null, error: null })),
        })),
    })),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock src/lib/supabase
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('@/src/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
            signInWithOtp: jest.fn(() => Promise.resolve({ data: {}, error: null })),
            signOut: jest.fn(() => Promise.resolve({ error: null })),
            onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
        },
    },
    getSession: jest.fn(() => Promise.resolve(null)),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock src/lib/secureStore
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('@/src/lib/secureStore', () => ({
    getSecureItem: jest.fn(() => Promise.resolve(null)),
    setSecureItem: jest.fn(() => Promise.resolve()),
    deleteSecureItem: jest.fn(() => Promise.resolve()),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock axios (API client)
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('axios', () => {
    const mockAxios = {
        create: jest.fn(() => mockAxios),
        get: jest.fn(() => Promise.resolve({ data: {} })),
        post: jest.fn(() => Promise.resolve({ data: {} })),
        put: jest.fn(() => Promise.resolve({ data: {} })),
        patch: jest.fn(() => Promise.resolve({ data: {} })),
        delete: jest.fn(() => Promise.resolve({ data: {} })),
        interceptors: {
            request: { use: jest.fn(), eject: jest.fn() },
            response: { use: jest.fn(), eject: jest.fn() },
        },
    };
    return mockAxios;
});

// ─────────────────────────────────────────────────────────────────────────────
// Mock expo-clipboard
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('expo-clipboard', () => ({
    setStringAsync: jest.fn(() => Promise.resolve()),
    getStringAsync: jest.fn(() => Promise.resolve('')),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock expo-linking
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('expo-linking', () => ({
    createURL: jest.fn((path: string) => `creatorx://${path}`),
    parse: jest.fn((url: string) => ({ path: url, queryParams: {} })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock react-native-safe-area-context
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    return {
        SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
        SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
        useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    };
});

// ─────────────────────────────────────────────────────────────────────────────
// Mock react-native-gesture-handler
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
        GestureHandlerRootView: View,
        Swipeable: View,
        DrawerLayout: View,
        State: {},
        ScrollView: View,
        PanGestureHandler: View,
        BaseButton: View,
        RectButton: View,
        LongPressGestureHandler: View,
        FlingGestureHandler: View,
        ForceTouchGestureHandler: View,
        NativeViewGestureHandler: View,
        PinchGestureHandler: View,
        RotationGestureHandler: View,
        TapGestureHandler: View,
        Directions: {},
    };
});

// ─────────────────────────────────────────────────────────────────────────────
// Mock @expo/vector-icons
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        Feather: ({ name }: { name: string }) => React.createElement(Text, { testID: `icon-${name}` }, name),
        MaterialIcons: ({ name }: { name: string }) => React.createElement(Text, { testID: `icon-${name}` }, name),
        Ionicons: ({ name }: { name: string }) => React.createElement(Text, { testID: `icon-${name}` }, name),
    };
});

// ─────────────────────────────────────────────────────────────────────────────
// Mock WebSocket service
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('@/src/services/WebSocketService', () => ({
    webSocketService: {
        connect: jest.fn(() => Promise.resolve()),
        disconnect: jest.fn(),
        connected: false,
        subscribeToThreads: jest.fn(() => jest.fn()),
        subscribeToThreadMessages: jest.fn(() => jest.fn()),
        onError: jest.fn(() => jest.fn()),
        onDisconnect: jest.fn(() => jest.fn()),
        onConnect: jest.fn(() => jest.fn()),
    },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Silence console warnings during tests
// ─────────────────────────────────────────────────────────────────────────────

const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
    console.warn = (...args) => {
        if (args[0]?.includes?.('Animated') || args[0]?.includes?.('useNativeDriver')) {
            return;
        }
        originalWarn(...args);
    };
    console.error = (...args) => {
        if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('act(...)')) {
            return;
        }
        originalError(...args);
    };
});

afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;
});

// ─────────────────────────────────────────────────────────────────────────────
// Global test timeout
// ─────────────────────────────────────────────────────────────────────────────

jest.setTimeout(10000);
