import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  native: 'com.Polang.app:/oauthredirect', // musi być zgodny z package name
});

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '991664220333-3en3lvdts1vun762rd4j0tnr4rbt4t70.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    redirectUri,
  });

  return {
    request,
    response,
    promptAsync: () => promptAsync({ useProxy: false }), // WAŻNE!
  };
};
