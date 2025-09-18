import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Menu, 
  Gift, 
  Store, 
  Calendar, 
  ShoppingCart,
  User,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm" data-testid="navigation-header">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <Heart className="text-primary text-2xl" />
              <span className="font-serif font-bold text-xl text-secondary">WeddingHub</span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:flex space-x-6">
                <Link 
                  href="/registry" 
                  className={`transition-colors ${isActive('/registry') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                  data-testid="link-registries"
                >
                  Registries
                </Link>
                <Link 
                  href="/vendors" 
                  className={`transition-colors ${isActive('/vendors') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                  data-testid="link-vendors"
                >
                  Vendors
                </Link>
                <Link 
                  href="/events" 
                  className={`transition-colors ${isActive('/events') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                  data-testid="link-events"
                >
                  Events
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:flex" data-testid="button-cart">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild data-testid="button-user-menu">
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                        <AvatarFallback>
                          {user?.firstName?.[0] || user?.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user?.firstName && (
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                        )}
                        {user?.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild data-testid="menu-item-profile">
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'vendor' && (
                      <DropdownMenuItem asChild data-testid="menu-item-vendor-dashboard">
                        <Link href="/vendor-dashboard">
                          <Store className="mr-2 h-4 w-4" />
                          Vendor Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/api/logout'}
                      data-testid="menu-item-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-sign-in"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-get-started"
                >
                  Get Started
                </Button>
              </div>
            )}
            
            <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-mobile-menu">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
