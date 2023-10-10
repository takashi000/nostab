import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthScreen } from './components/auth-screen';
import { AuthLoader } from './lib/auth';
import { AuthContainer } from './components/ui';
import { Nostr } from '../Nostr/Nostr';

const Auth = () => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <AuthContainer>
      <QueryClientProvider client={queryClient}>
        <AuthLoader
          renderLoading={() => <div>Loading ...</div>}
          renderUnauthenticated={() => <AuthScreen />}
        >
          <Nostr />
        </AuthLoader>
      </QueryClientProvider>
    </AuthContainer>
  );
};

export default Auth;
