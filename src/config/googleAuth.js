import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const isStandalone = Constants.appOwnership === 'standalone';

const redirectUri = AuthSession.makeRedirectUri({ useProxy: !isStandalone });

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '991664220333-2769rq130h3aue9tgsqolbhu4kmc5r4t.apps.googleusercontent.com',
    webClientId: '991664220333-2769rq130h3aue9tgsqolbhu4kmc5r4t.apps.googleusercontent.com', 
    androidClientId: '991664220333-3en3lvdts1vun762rd4j0tnr4rbt4t70.apps.googleusercontent.com',
      redirectUri, // <- DODAJ TO

  });


 return {
    request,
    response,
    promptAsync,
  };
};