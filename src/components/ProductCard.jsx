import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ImageOff } from 'lucide-react';
import { addToCart } from '../api/services';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useCart } from '../hooks/useCart';
import { AppContext } from '../Context/AppContext';

function ProductCard({ product }) {
  const { handleError, showToast } = useErrorHandler();
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { isAuthenticated } = useContext(AppContext);

  const handleProductClick = () => {
    if (isAuthenticated) {
      navigate(`/product/${product.id}`);
    } else {
      handleError('Please log in to view product details.', 'error');
      navigate('/login', { state: { from: `/product/${product.id}` } });
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!isAuthenticated) {
        handleError('Please log in to add items to your cart.', 'error');
        return;
      }
      setAddingToCart(true);
      console.log('ProductCard: Adding product to cart:', product.id);
      
      await addToCart(product.id, 1);
      console.log('ProductCard: Successfully added to cart, now refreshing...');
      
      // Refresh cart context after successful API call
      await fetchCart();
      console.log('ProductCard: Cart refreshed');
      
      setAddedToCart(true);
      handleError('Added to cart successfully!', 'success');
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      handleError(error, {
        fallbackMessage: 'Failed to add item to cart. Please try again.',
        showToast: true,
        context: 'add_to_cart'
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleLike = () => {
    // Implement like functionality here
    showToast('Item liked!', 'success');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="relative aspect-square bg-gray-100">
        {imageError ? (
          // Error fallback display
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
            <ImageOff size={32} className="mb-2" />
            <span className="text-xs text-center">Image unavailable</span>
          </div>
        ) : (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            )}
            <img
              src={product.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={handleProductClick}
            />
          </>
        )}
        
        {/* Like button overlay */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50"
        >
          <Heart size={16} className="text-gray-600" />
        </button>
        
        {/* Quick add to cart overlay */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              addedToCart
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {addingToCart ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding...</span>
              </>
            ) : addedToCart ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-500">{product.category || product.type}</p>
          {product.season && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {product.season}
            </span>
          )}
        </div>
        <h3 
          className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={handleProductClick}
        >
          {product.name}
        </h3>
        
        {/* Enhanced product details */}
        {(product.color || product.size) && (
          <div className="flex items-center gap-2 mb-2">
            {product.color && (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {product.color}
              </span>
            )}
            {product.size && (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {product.size}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-gray-900">${product.price}</p>
          </div>
          
          {/* Mobile Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="md:hidden p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {addingToCart ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : addedToCart ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <ShoppingCart size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
