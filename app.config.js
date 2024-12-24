module.exports = {
  expo: {
    name: "receipefinder",
    slug: "receipefinder",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.jpeg",
          color: "#FF6B6B",
          sounds: ["./assets/notification-sound.wav"]
        }
      ]
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.receipefinder"
    },
    android: {
      package: "com.yourcompany.receipefinder",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    extra: {
      eas: {
        projectId: "da627a4e-c8a7-48de-8495-bc79bf2df5ad"
      }
    },
    scheme: "receipefinder",
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true
    }
  }
}; 