import { Bell, Home, Package, ShoppingBag, Menu, X } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../Context/AppContext";
import { useCart } from "../hooks/useCart";

function Navbar() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout, isAuthenticated } = useContext(AppContext);
    const { cartCount } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);
    
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };
    
    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        navigate("/");
    };

    // console.log('Navbar render:', { token: !!token, user: !!user, isAuthenticated });

    return (
        <>
            {/* Main Navigation Bar */}
            <nav className={`bg-white border-b border-gray-200 transition-shadow duration-300 ${
                isScrolled ? 'shadow-lg' : 'shadow-sm'
            }`} role="navigation" aria-label="Main navigation">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center space-x-2 group">
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                                    CIPR
                                </span>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    isActive('/') 
                                        ? 'text-blue-600 bg-blue-50' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/collections"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    isActive('/collections') 
                                        ? 'text-blue-600 bg-blue-50' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                Collections
                            </Link>
                            <Link
                                to="/new"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    isActive('/new') 
                                        ? 'text-blue-600 bg-blue-50' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                New Arrivals
                            </Link>
                            <Link
                                to="/products"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    isActive('/products') 
                                        ? 'text-blue-600 bg-blue-50' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                Products
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            <Link 
                                to="/cart" 
                                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                aria-label="Shopping cart with 0 items"
                            >
                                <ShoppingBag size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-medium">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            <button 
                                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                aria-label="Notifications - 2 unread"
                            >
                                <Bell size={20} />
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                                    2
                                </span>
                            </button>

                            {isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-700">
                                        Welcome, {user?.name || 'User'}
                                    </span>
                                    <button 
                                        onClick={handleLogout}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link 
                                        to="/register" 
                                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                                    >
                                        Register
                                    </Link>
                                    <Link 
                                        to="/login" 
                                        className="px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors duration-200"
                                    >
                                        Login
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="md:hidden flex items-center space-x-3">
                            <Link 
                                to="/cart" 
                                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                            >
                                <ShoppingBag size={20} />
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                                    0
                                </span>
                            </Link>

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className={`fixed top-16 left-0 right-0 bg-white shadow-lg z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="px-4 py-6 space-y-4">
                    <Link
                        to="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                            isActive('/') 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Home size={20} />
                        <span className="font-medium">Home</span>
                    </Link>
                    <Link
                        to="/collections"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                            isActive('/collections') 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Package size={20} />
                        <span className="font-medium">Collections</span>
                    </Link>
                    <Link
                        to="/new"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                            isActive('/new') 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <ShoppingBag size={20} />
                        <span className="font-medium">New Arrivals</span>
                    </Link>
                    <Link
                        to="/products"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                            isActive('/products') 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Package size={20} />
                        <span className="font-medium">Products</span>
                    </Link>

                    {/* Mobile Authentication */}
                    <div className="pt-4 border-t border-gray-200">
                        {isAuthenticated ? (
                            <div className="space-y-2">
                                <div className="px-4 py-2 text-sm text-gray-600">
                                    Welcome, {user?.name || 'User'}
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link
                                    to="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                >
                                    Register
                                </Link>
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
                                >
                                    Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Navbar;