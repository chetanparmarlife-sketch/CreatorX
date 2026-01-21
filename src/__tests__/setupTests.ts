/**
 * Jest Setup File for Integration Tests
 * 
 * Configures MSW server for API mocking
 */

import { server } from './mocks/server';

// Start MSW server before all tests
beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test
afterEach(() => {
    server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
    server.close();
});

// Global test timeout
jest.setTimeout(10000);

// Mock AsyncStorage for React Native
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(() =>
        Promise.resolve({ granted: true })
    ),
    launchImageLibraryAsync: jest.fn(() =>
        Promise.resolve({
            canceled: false,
            assets: [
                {
                    uri: 'file:///mock/image.jpg',
                    type: 'image/jpeg',
                    fileName: 'test.jpg',
                },
            ],
        })
    ),
    MediaTypeOptions: {
        Images: 'Images',
    },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
        replace: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: 'SafeAreaView',
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Silence console.warn for specific messages in tests
const originalWarn = console.warn;
console.warn = (...args) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('AsyncStorage') || args[0].includes('[MSW]'))
    ) {
        return;
    }
    originalWarn.apply(console, args);
};
