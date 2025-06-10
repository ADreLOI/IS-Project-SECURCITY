import 'dotenv/config';

export default {
  expo: {
    name: "SecurCity",
    slug: "SecurCity",
    scheme: "your.scheme",
    version: "1.0.0",
    owner: "mattdema17",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "our.scheme",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_2 || "",
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#0D2226",
      },
      edgeToEdgeEnabled: true,
      package: "our.scheme",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_2 || "",
        },
      },
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-location",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/adaptive-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#0D2226",
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme:
            "our.scheme",
        },
      ],
      [
        "expo-maps",
        {
          requestLocationPermission: "true",
          locationPermission: "Allow $(SecurCity) to use your location",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      apiUrl: process.env.API_BASE_URL || "",
      iosClientId: process.env.IOS_CLIENT_ID || "",
      webClientId: process.env.WEB_CLIENT_ID || "",
    },
  },
};