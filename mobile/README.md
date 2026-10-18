# Mobile app

The mobile client is built with Expo and React Native. Navigation and screens
are in `src/screens/`; API clients are in `src/api/`, and authentication state
is managed in `src/context/`.

## Requirements

- Node.js and npm
- Expo CLI through `npx` (no global installation is required)
- The Skillinex backend running locally or a reachable deployed API

## Local development

From this directory:

```bash
npm ci
cp .env.example .env
npx expo start
```

Set `EXPO_PUBLIC_API_URL` in `.env`. Use `http://localhost:8008` when the
simulator can reach the development computer's loopback address. For a
physical device, replace `localhost` with the computer's LAN IP address and
ensure the device and computer can reach each other.

The Expo development server shows how to open the app in an emulator or
compatible Expo client. Native builds can be started with:

```bash
npx expo run:android
npx expo run:ios
```

These commands generate native project directories as needed. The generated
`android/` and `ios/` directories are ignored; the JavaScript/Expo project is
the source of truth. The current package manifest does not define a mobile
test script.

Do not commit `.env`, `node_modules/`, or generated build output.