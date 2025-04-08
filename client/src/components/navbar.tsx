import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  TrendingUp,
  DollarSign,
  BarChart2,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Temporarily replace with a dummy user state until auth is fixed
  const user = null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/stock/${searchTerm.trim().toUpperCase()}`);
      setSearchTerm("");
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">YahooFinance</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Markets
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/stock/SPY")}>
                S&P 500
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/stock/DIA")}>
                Dow Jones
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/stock/QQQ")}>
                Nasdaq
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/stock/BTC-USD")}>
                Bitcoin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/stock/ETH-USD")}>
                Ethereum
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Popular Stocks
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/stock/AAPL")}>
                Apple (AAPL)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/stock/MSFT")}>
                Microsoft (MSFT)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/stock/AMZN")}>
                Amazon (AMZN)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/stock/GOOGL")}>
                Alphabet (GOOGL)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/stock/META")}>
                Meta (META)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/stock/TSLA")}>
                Tesla (TSLA)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Desktop Search & Auth */}
        <div className="hidden md:flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Search ticker..."
              className="w-[200px] lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3"
              type="submit"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.username}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <Link 
                  href="/" 
                  onClick={() => setIsMenuOpen(false)} 
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">YahooFinance</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              <form onSubmit={handleSearch} className="relative mb-6">
                <Input
                  type="search"
                  placeholder="Search ticker..."
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3"
                  type="submit"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <div className="space-y-4">
                <Link 
                  href="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-base font-medium"
                >
                  Home
                </Link>

                <div>
                  <p className="block py-2 text-base font-medium">Markets</p>
                  <div className="ml-4 space-y-1 border-l pl-4">
                    <Link
                      href="/stock/SPY"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 text-sm"
                    >
                      S&P 500
                    </Link>
                    <Link
                      href="/stock/DIA"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 text-sm"
                    >
                      Dow Jones
                    </Link>
                    <Link
                      href="/stock/QQQ"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 text-sm"
                    >
                      Nasdaq
                    </Link>
                    <Link
                      href="/stock/BTC-USD"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 text-sm"
                    >
                      Bitcoin
                    </Link>
                    <Link
                      href="/stock/ETH-USD"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 text-sm"
                    >
                      Ethereum
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="block py-2 text-base font-medium">
                    Popular Stocks
                  </p>
                  <div className="ml-4 space-y-1 border-l pl-4">
                    <Link
                      href="/stock/AAPL"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 text-sm"
                    >
                      Apple (AAPL)
                    </Link>
                    <Link
                      href="/stock/MSFT"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 text-sm"
                    >
                      Microsoft (MSFT)
                    </Link>
                    <Link
                      href="/stock/AMZN"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 text-sm"
                    >
                      Amazon (AMZN)
                    </Link>
                    <Link
                      href="/stock/GOOGL"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 text-sm"
                    >
                      Alphabet (GOOGL)
                    </Link>
                    <Link
                      href="/stock/META"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 text-sm"
                    >
                      Meta (META)
                    </Link>
                    <Link
                      href="/stock/TSLA"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 text-sm"
                    >
                      Tesla (TSLA)
                    </Link>
                  </div>
                </div>

                <div className="border-t pt-4">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Avatar className="h-9 w-9 mr-2">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => {
                        navigate("/auth");
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}