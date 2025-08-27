import { Bell, Home, Package, ShoppingBag, Menu, X } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useCart } from "../hooks/useCart";

function Navbar() {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);
    
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
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className={`bg-white border-b border-gray-200 transition-shadow duration-300 ${
            isScrolled ? 'shadow-lg' : 'shadow-sm'
        }`} role="navigation" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                                CIPR
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
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
                            to="/products"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                isActive('/products') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                            Products
                        </Link>
                        
                        <Link
                            to="/purchase-history"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                isActive('/purchase-history') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                            Order History
                        </Link>
                    </div>

                    {/* Right Side - Cart & Auth */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Link 
                            to="/cart" 
                            className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            aria-label={`Shopping cart with ${cartCount} items`}
                        >
                            <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-medium">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Desktop Auth */}
                        {isAuthenticated ? (
                            <div className="hidden md:flex items-center gap-4">
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
                            <div className="hidden md:flex items-center gap-2">
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

                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Toggle mobile menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? (
                                <X size={20} />
                            ) : (
                                <Menu size={20} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div className="px-4 py-2 space-y-1">
                        {/* Navigation Links */}
                        <Link
                            to="/"
                            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                isActive('/') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <Home size={16} />
                                <span>Home</span>
                            </div>
                        </Link>
                        
                        <Link
                            to="/products"
                            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                isActive('/products') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <Package size={16} />
                                <span>Products</span>
                            </div>
                        </Link>
                        
                        <Link
                            to="/purchase-history"
                            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                isActive('/purchase-history') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <Bell size={16} />
                                <span>Order History</span>
                            </div>
                        </Link>

                        {/* Mobile Auth */}
                        {isAuthenticated ? (
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                <div className="px-3 py-2 text-sm text-gray-700">
                                    Welcome, {user?.name || 'User'}
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                                <Link 
                                    to="/register" 
                                    className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                                >
                                    Register
                                </Link>
                                <Link 
                                    to="/login" 
                                    className="block px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors duration-200"
                                >
                                    Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;