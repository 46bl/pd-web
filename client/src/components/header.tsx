import { useState } from "react";
import { Search, Menu, Gamepad2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
const logoImage = "https://i.postimg.cc/0j1BFrgF/Untitled-3.png";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Branding */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-primary flex items-center" data-testid="brand-logo">
              <img src={logoImage} alt="PlayDirty" className="w-8 h-8 mr-2" />
              PlayDirty
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-input text-foreground px-4 py-2 pl-10 rounded-lg border border-border focus:border-primary focus:outline-none search-glow transition-all duration-300"
                data-testid="input-search-desktop"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <a href="/" className="text-foreground hover:text-primary transition-colors" data-testid="link-home">
              Home
            </a>
            <a href="/products" className="text-foreground hover:text-primary transition-colors" data-testid="link-products">
              Products
            </a>
            <a href="/support" className="text-foreground hover:text-primary transition-colors" data-testid="link-support">
              Support
            </a>
            <a href="/about" className="text-foreground hover:text-primary transition-colors" data-testid="link-about">
              About
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col space-y-4 mt-8">
                <a href="/" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-home">
                  Home
                </a>
                <a href="/products" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-products">
                  Products
                </a>
                <a href="/support" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-support">
                  Support
                </a>
                <a href="/about" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-about">
                  About
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-input text-foreground px-4 py-2 pl-10 rounded-lg border border-border focus:border-primary focus:outline-none"
              data-testid="input-search-mobile"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
