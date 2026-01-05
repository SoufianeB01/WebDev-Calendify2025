import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx';
import { routeTree } from './routeTree.gen';
import './styles.css';
import reportWebVitals from './reportWebVitals.ts';
import { SidebarProvider } from './components/ui/sidebar.tsx';
import { AuthProvider } from './lib/auth.tsx';

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
        <AuthProvider>
          <AppRoot />
        </AuthProvider>
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  );
}

reportWebVitals();
