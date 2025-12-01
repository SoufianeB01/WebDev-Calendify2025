import { StrictMode, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx';
import { routeTree } from './routeTree.gen';
import './styles.css';
import reportWebVitals from './reportWebVitals.ts';
import { SidebarProvider } from './components/ui/sidebar.tsx';
import Login from './components/Login';

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
const router = createRouter({
  routeTree,
  context: { ...TanStackQueryProviderContext },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppRoot() {
  const [loggedIn, setLoggedIn] = useState(false);
  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Login onSuccess={() => { setLoggedIn(true); router.navigate({ to: '/dashboard' }); }} />
      </div>
    );
  }
  return (
    <SidebarProvider>
      <RouterProvider router={router} />
    </SidebarProvider>
  );
}

const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <AppRoot />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  );
}

reportWebVitals();
