import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import { getProductById, addToCart } from '../api/services';
import CiprRecommendation from '../components/CiprRecommendation';
import Recommendation from '../components/Recommendation';
import { useCart } from '../hooks/useCart';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const { addItemToCart, fetchCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        
        // Enhanced product data for better demo
        const enhancedProduct = {
          ...response.product,
          // Use images from enhanceProduct function (already has local images mapped by category)
          images: response.product.images && response.product.images.length > 0 
            ? response.product.images 
            : [response.product.image], // Fallback to single image if no images array
          rating: Math.random() * 2 + 3,
          reviewCount: Math.floor(Math.random() * 500) + 50,
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          colors: ['Black', 'White', 'Gray', 'Navy'],
          description: `Experience premium quality with our ${response.product.name}. Crafted with attention to detail and designed for modern living, this piece combines style and functionality seamlessly.`,
          inStock: true
        };
        
        setProduct(enhancedProduct);
        setSelectedSize(enhancedProduct.sizes[1]);
        setSelectedColor(enhancedProduct.colors[0]);
      } catch (err) {
        setError('Failed to load product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      setCartSuccess(false);
      
      // Add to cart via API
      await addToCart(product.id, quantity);
      
      // Update local cart context
      addItemToCart({
        id: product.id,
        product_id: product.id,
        product_name: product.name,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor
      });
      
      // Also refresh cart from server to stay in sync
      fetchCart();
      
      setCartSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setCartSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // You could add toast notification here if you have it
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-4/5 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-gray-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-medium text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <button
                  onClick={handleWishlist}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart
                    size={24}
                    className={isWishlisted ? 'fill-current text-red-500' : ''}
                  />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(product.rating)
                          ? 'text-gray-900 fill-current'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-medium text-gray-900">
                  ${product.price}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Options */}
            <div className="space-y-6">
              {/* Size Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm border rounded-lg transition-all ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm border rounded-lg transition-all ${
                        selectedColor === color
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`w-full py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${
                  cartSuccess 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : addingToCart
                    ? 'bg-gray-600 text-white cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : cartSuccess ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              
              <button className="w-full border border-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center space-x-2">
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        
        <div className="mt-16 pt-16 border-t border-gray-200">
          <CiprRecommendation />
        </div>
         <div className="mt-16 pt-16 border-t border-gray-200">
          <Recommendation />
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
