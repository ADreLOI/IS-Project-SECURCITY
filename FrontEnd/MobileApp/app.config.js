import 'dotenv/config';

export default 
{
  "expo": {
    "name": "SecurCity",
    "slug": "SecurCity",
    "scheme": "com.mattdema.securcity",
    "version": "1.0.0",
    "owner": "mattdema",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.mattdema.securcity",
      "config": {
        "googleMapsApiKey": process.env.GOOGLE_MAPS_API_KEY || ""
      },
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "package": "com.AndreaPezzo.securcity",
      "config": {
        "googleMaps": {
          "apiKey": process.env.GOOGLE_MAPS_API_KEY || ""
        }
      },
      "permissions": [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": process.env.IOS_URL_SCHEME || "",
        }
      ],
      [
        "expo-maps",
        {
          "requestLocationPermission": "true",
          "locationPermission": "Allow $(SecurCity) to use your location"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId":"0f8eff7a-84b0-4265-9967-653f44445113"
      },
      "apiUrl": process.env.API_BASE_URL || "http://localhost:3000",
      "iosClientId": process.env.IOS_CLIENT_ID || "",
      "webClientId": process.env.WEB_CLIENT_ID || ""
    }
  }
}