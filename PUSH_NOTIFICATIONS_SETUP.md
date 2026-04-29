# Push Notifications Setup

This guide explains what a developer needs to set up before CreatorX can send push notifications to creators.

## Why This Matters

Push notifications tell creators when important things happen, like campaign approvals, payment updates, new messages, and KYC status changes. Without this setup, the app still opens normally, but creators will not receive those alerts.

## 1. Create A Firebase Project

1. Go to `https://console.firebase.google.com`.
2. Click `Add project`.
3. Name it something clear, such as `CreatorX Staging` or `CreatorX Production`.
4. Finish the setup wizard.

Use separate Firebase projects for staging and production if possible. That keeps test notifications away from real users.

## 2. Add The Android App

1. In Firebase, open Project Settings.
2. Under `Your apps`, choose Android.
3. Use the Android package name from [app.json](app.json): `com.creatorx.app`.
4. Download `google-services.json`.
5. Put `google-services.json` in the project root.

Do not commit `google-services.json`. It is ignored by git because it contains Firebase project credentials.

## 3. Add The iOS App

1. In Firebase, open Project Settings.
2. Under `Your apps`, choose iOS.
3. Use the iOS bundle ID from [app.json](app.json): `com.creatorx.app`.
4. Download `GoogleService-Info.plist`.
5. Put `GoogleService-Info.plist` in the project root.

Do not commit `GoogleService-Info.plist`. It is ignored by git because it contains Firebase project credentials.

## 4. Install The Mobile Packages

Run these commands from the project root:

```bash
npx expo install @react-native-firebase/messaging
npx expo install react-native-device-info
```

The app has a safe fallback, so it will not crash before these packages are installed. Notifications simply stay disabled until setup is complete.

## 5. Update Expo Config

Ask the mobile developer to add the Firebase plugin configuration to `app.json` or migrate the app to `app.config.js` if dynamic config is needed.

The developer should confirm that Android uses `google-services.json` and iOS uses `GoogleService-Info.plist`.

## 6. Build And Test

1. Create a development build or staging build.
2. Install it on a physical Android or iOS device.
3. Log in as a creator.
4. Confirm the app asks for notification permission.
5. Confirm the device token is registered with the backend.
6. Send a test notification from Firebase Console.

Push notifications usually do not work correctly in Expo Go. Test with a real development or production build.

## 7. Production Checklist

- Use the production Firebase project for production builds.
- Keep Firebase config files out of git.
- Confirm the backend can send notifications through Firebase Cloud Messaging.
- Test campaign, payment, KYC, and message notifications before launch.
