import { Link, useRouterState } from '@tanstack/react-router';
import { Package, Users, FileText } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { SiCoffeescript } from 'react-icons/si';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const { identity } = useInternetIdentity();
  const currentPath = routerState.location.pathname;

  const userName = identity?.getPrincipal().toString().slice(0, 8) + '...';

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <span>Inventory Manager</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/inventory"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/inventory')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Inventory
              </Link>
              <Link
                to="/customers"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/customers')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Customers
              </Link>
              <Link
                to="/quotes"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/quotes')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Quotes
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {userName && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {userName}
              </span>
            )}
            <LoginButton />
          </div>
        </div>
      </header>
      <main className="container py-6">{children}</main>
      <footer className="border-t mt-auto">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} · Built with{' '}
            <SiCoffeescript className="inline w-4 h-4 text-primary" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
