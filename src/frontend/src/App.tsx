import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import AppLayout from './components/layout/AppLayout';
import LoginScreen from './components/auth/LoginScreen';
import InventoryListPage from './pages/inventory/InventoryListPage';
import InventoryItemDetailPage from './pages/inventory/InventoryItemDetailPage';
import CustomersListPage from './pages/customers/CustomersListPage';
import CustomerDetailPage from './pages/customers/CustomerDetailPage';
import QuotesListPage from './pages/quotes/QuotesListPage';
import CreateQuotePage from './pages/quotes/CreateQuotePage';
import QuoteDetailPage from './pages/quotes/QuoteDetailPage';

function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  
  const isAuthenticated = !!identity;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <Outlet />;
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: InventoryListPage,
});

const inventoryRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/inventory',
  component: InventoryListPage,
});

const inventoryDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/inventory/$id',
  component: InventoryItemDetailPage,
});

const customersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/customers',
  component: CustomersListPage,
});

const customerDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/customers/$id',
  component: CustomerDetailPage,
});

const quotesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/quotes',
  component: QuotesListPage,
});

const createQuoteRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/quotes/create',
  component: CreateQuotePage,
});

const quoteDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/quotes/$id',
  component: QuoteDetailPage,
});

const routeTree = rootRoute.addChildren([
  authenticatedRoute.addChildren([
    indexRoute,
    inventoryRoute,
    inventoryDetailRoute,
    customersRoute,
    customerDetailRoute,
    quotesRoute,
    createQuoteRoute,
    quoteDetailRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
