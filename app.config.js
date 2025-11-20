import { execSync } from 'child_process';

// Função para obter o hash do commit mais recente
const getCommitHash = () => {
  try {
    return process.env.COMMIT_HASH || execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    return 'development';
  }
};

export default {
  expo: {
    name: "work360",
    slug: "work360",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: ["expo-router", "expo-font", "expo-web-browser"],
    experiments: {
      "typedRoutes": true
    },
    extra: {
      commitHash: getCommitHash(),
    },
  }
};
