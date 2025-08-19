import { api, ENDPOINTS } from './index';
import { getProductImage, getAllImagesForCategory } from '../utils/imageMapping';

// Cart management
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post(ENDPOINTS.CART, {
      product_id: productId,
      quantity,
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to add to cart.');
  }
};

export const getCart = async () => {
  try {
    const response = await api.get(ENDPOINTS.CART);
    const cartItems = response.data?.items || response.data || [];
    
    // If no cart items, return empty cart immediately
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { items: [] };
    }
    
    // Try to enhance cart items, but don't fail if enhancement fails
    try {
      const enhancedItems = await Promise.all(
        cartItems.map(async (item) => {
          try {
            // Only try to fetch product details if we have a valid product_id
            if (!item.product_id) {
              return {
                ...item,
                product_name: item.name || item.product_name || 'Unknown Product',
                name: item.name || item.product_name || 'Unknown Product',
                image: item.image || '/images/t-shirt1.png' // Fallback to default image
              };
            }
            
            // Fetch full product details for each cart item
            const productResponse = await api.get(ENDPOINTS.PRODUCT_BY_ID(item.product_id));
            const product = productResponse.data?.product || productResponse.data;
            
            if (!product) {
              throw new Error('Product not found');
            }
            
            // Enhance product with additional data
            const enhancedProduct = enhanceProduct(product);
            
            // Merge cart item data with enhanced product data
            return {
              ...item,
              product_name: enhancedProduct.name,
              name: enhancedProduct.name,
              title: enhancedProduct.name,
              price: enhancedProduct.price || item.price || 0,
              image: enhancedProduct.image || item.image || '/images/t-shirt1.png',
              category: enhancedProduct.category,
              size: item.size || enhancedProduct.size,
              color: item.color || enhancedProduct.color,
            };
          } catch (productError) {
            // Silent fallback - don't log warnings in production
            if (import.meta.env.DEV) {
              console.warn(`Failed to enhance cart item ${item.product_id}:`, productError.message);
            }
            // Return original cart item with safe fallback values
            return {
              ...item,
              product_name: item.name || item.product_name || `Product ${item.product_id || 'Unknown'}`,
              name: item.name || item.product_name || `Product ${item.product_id || 'Unknown'}`,
              image: item.image || '/images/t-shirt1.png',
              price: item.price || 0
            };
          }
        })
      );
      
      return { items: enhancedItems };
    } catch (enhancementError) {
      // If enhancement fails completely, return basic cart items
      if (import.meta.env.DEV) {
        console.warn('Cart enhancement failed, returning basic cart items:', enhancementError.message);
      }
      
      // Return unenhanced but safe cart items
      const safeItems = cartItems.map(item => ({
        ...item,
        product_name: item.name || item.product_name || `Product ${item.product_id || 'Unknown'}`,
        name: item.name || item.product_name || `Product ${item.product_id || 'Unknown'}`,
        image: item.image || '/images/t-shirt1.png',
        price: item.price || 0
      }));
      
      return { items: safeItems };
    }
  } catch (err) {
    console.error('Cart API call failed:', err);
    throw new Error(err.response?.data?.error || err.message || 'Failed to fetch cart.');
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    const response = await api.put(`${ENDPOINTS.CART}/${cartItemId}`, {
      quantity: Math.max(1, quantity),
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to update cart item quantity.');
  }
};

// Remove item from cart
export const removeCartItem = async (cartItemId) => {
  try {
    const response = await api.delete(`${ENDPOINTS.CART}/${cartItemId}`);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to remove cart item.');
  }
};

// Clear entire cart
export const clearCart = async () => {
  try {
    const response = await api.delete(ENDPOINTS.CART);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to clear cart.');
  }
};

// Purchase history
export const getPurchaseHistory = async () => {
  try {
    const response = await api.get(ENDPOINTS.SALES);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to fetch purchase history.');
  }
};

export const purchaseProducts = async (cartIds) => {
  try {
    const response = await api.post(ENDPOINTS.SALES, {
      cart_ids: cartIds,
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to complete purchase.');
  }
};

// Enhanced product data processing (no fallback data, only process valid API responses)
const enhanceProduct = (product) => {
  // Only process if product has required fields from API
  if (!product || !product.id) {
    throw new Error('Invalid product data from API');
  }
  
  // Handle description - it can be an array or string from API
  let descriptionArray = [];
  if (Array.isArray(product.description)) {
    descriptionArray = product.description;
  } else if (typeof product.description === 'string') {
    descriptionArray = product.description.split(' ').filter(word => word.trim().length > 0);
  }
  
  // Known categories from the API
  const validCategories = ['t-shirt', 'dress', 'suit', 'short', 'jacket', 'sportwear', 'shoes', 'coat', 'hat', 'pyjamas', 'undies'];
  
  // Extract category (first element in description array is usually the category)
  const categoryFromDescription = descriptionArray[0]?.toLowerCase();
  const category = validCategories.includes(categoryFromDescription) 
    ? categoryFromDescription.toUpperCase() 
    : 'UNCATEGORIZED';
  
  // Extract attributes from description array
  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
  const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow'];
  const genders = ['M', 'F', 'male', 'female', 'kid', 'adult', 'teen', 'baby'];
  const seasons = ['spring', 'summer', 'fall', 'winter'];
  
  // Find attributes in the description array
  const extractedSize = descriptionArray.find(item => 
    sizes.some(size => size.toLowerCase() === item.toLowerCase())
  );
  const extractedColor = descriptionArray.find(item => 
    colors.some(color => color.toLowerCase() === item.toLowerCase())
  );
  const extractedGender = descriptionArray.find(item => 
    genders.some(gender => gender.toLowerCase() === item.toLowerCase())
  );
  const extractedSeason = descriptionArray.find(item => 
    seasons.some(season => season.toLowerCase() === item.toLowerCase())
  );
  
  return {
    ...product,
    category,
    type: category,
    size: extractedSize,
    color: extractedColor,
    gender: extractedGender,
    season: extractedSeason,
    // Convert price to number for better filtering/sorting
    price: parseFloat(product.price) || 0,
    // Use local images based on category, fallback to API image
    image: getProductImage(category, product.image, product.id),
    // For product detail pages - get all available images for the category
    images: getAllImagesForCategory(category),
    // Keep original description for display
    descriptionText: Array.isArray(product.description) 
      ? product.description.join(' ') 
      : product.description || ''
  };
};

// Products API (public endpoint) - No fallback data, strict API validation
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get(ENDPOINTS.PRODUCTS, { params });

    // Laravel response shape
    const { latest_products, best_selling_products, recommended_products } = response.data;

    if (!latest_products && !best_selling_products && !recommended_products) {
      throw new Error('Invalid API response structure');
    }

    // Combine products from API
    const allProducts = [
      ...(latest_products || []),
      ...(best_selling_products || []),
      ...(recommended_products || [])
    ];

    // Filter out invalid products
    const validProducts = allProducts.filter(
      (product) => product && typeof product === 'object' && product.id
    );

    if (validProducts.length === 0) {
      throw new Error('No valid products received from API');
    }

    // Enhance products
    const enhancedProducts = validProducts.map(enhanceProduct);

    return {
      latest: (latest_products || []).map(enhanceProduct),
      bestSelling: (best_selling_products || []).map(enhanceProduct),
      recommended: (recommended_products || []).map(enhanceProduct),
      all: enhancedProducts
    };
  } catch (error) {
    console.error('Products API call failed:', error.message);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch products from API'
    );
  }
};

// Get single product by ID - No fallback, strict API validation
export const getProductById = async (id) => {
  try {
    const response = await api.get(ENDPOINTS.PRODUCT_BY_ID(id));
    
    // Handle different API response structures
    if (response.data?.product) {
      return { product: enhanceProduct(response.data.product) };
    }
    if (response.data && typeof response.data === 'object' && response.data.id) {
      return { product: enhanceProduct(response.data) };
    }
    
    throw new Error('Product not found in API response');
  } catch (error) {
    console.error('Product by ID API call failed:', error.message);
    throw new Error(error.response?.data?.message || error.message || `Failed to fetch product with ID: ${id}`);
  }
};

// Get products by API category - No fallback, strict API validation
export const getProductsByApiCategory = async (apiCategory = 'latest', limit = 4) => {
  try {
    // For recommended products, use the specific endpoint with limit
    if (apiCategory.toLowerCase() === 'recommended') {
      const response = await api.get(ENDPOINTS.PRODUCTS_WITH_LIMIT(limit));
      const products = response.data?.recommended_products || response.data?.latest_products || [];
      
      if (products.length === 0) {
        throw new Error('No recommended products available from API');
      }
      
      const validProducts = products.filter(product => 
        product && typeof product === 'object' && product.id
      );
      const enhancedProducts = validProducts.slice(0, limit).map(enhanceProduct);
      return { products: enhancedProducts };
    }

    const response = await api.get(ENDPOINTS.PRODUCTS);
    
    let products = [];
    switch (apiCategory.toLowerCase()) {
      case 'latest':
      case 'new':
        products = response.data?.latest_products || [];
        break;
      case 'best-selling':
      case 'best sellers':
        products = response.data?.best_selling_products || [];
        break;
      case 'recommended':
        products = response.data?.recommended_products || [];
        break;
      default:
        // Return all products mixed
        products = [
          ...(response.data?.latest_products || []),
          ...(response.data?.best_selling_products || []),
          ...(response.data?.recommended_products || [])
        ];
    }
    
    if (products.length === 0) {
      throw new Error(`No ${apiCategory} products available from API`);
    }
    
    // Filter valid products, enhance and limit
    const validProducts = products.filter(product => 
      product && typeof product === 'object' && product.id
    );
    
    if (validProducts.length === 0) {
      throw new Error(`No valid ${apiCategory} products received from API`);
    }
    
    const enhancedProducts = validProducts.slice(0, limit).map(enhanceProduct);
    return { products: enhancedProducts };
  } catch (error) {
    console.error(`Failed to fetch ${apiCategory} products:`, error.message);
    throw new Error(error.response?.data?.message || error.message || `Failed to fetch ${apiCategory} products from API`);
  }
};

// Get products by category (for homepage sections)
export const getProductsByCategory = async (category, limit = 4) => {
  try {
    // Map UI categories to API categories
    if (category === 'NEW' || category === 'LATEST') {
      return await getProductsByApiCategory('latest', limit);
    } else if (category === 'BEST SELLERS' || category === 'BEST-SELLING') {
      return await getProductsByApiCategory('best-selling', limit);
    } else if (category === 'RECOMMENDED') {
      return await getProductsByApiCategory('recommended', limit);
    } else if (category === 'all') {
      return await getProductsByApiCategory('all', limit);
    } else {
      // Filter by extracted category from description
      const { products } = await getProducts();
      const filtered = products.filter(p => p.category === category).slice(0, limit);
      return { products: filtered };
    }
  } catch (error) {
    console.error(`Failed to fetch ${category} products:`, error.message);
    throw new Error(`Failed to fetch products for category: ${category}`);
  }
};

// Search products - Requires authentication
export const searchProducts = async (searchTerm, limit = 10) => {
  try {
    const response = await api.get(ENDPOINTS.PRODUCT_SEARCH, {
      params: {
        search: searchTerm,
        limit: limit
      }
    });
    
    // Handle different API response structures
    let products = [];
    if (response.data?.products) {
      products = response.data.products;
    } else if (Array.isArray(response.data)) {
      products = response.data;
    } else {
      throw new Error('Invalid search API response structure');
    }
    
    if (products.length === 0) {
      return { products: [] }; // Empty results are valid
    }
    
    const validProducts = products.filter(product => 
      product && typeof product === 'object' && product.id
    );
    
    const enhancedProducts = validProducts.map(enhanceProduct);
    return { products: enhancedProducts };
  } catch (error) {
    console.error('Search API call failed:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to search products');
  }
};

// Get collections data
export const getCollections = async () => {
  try {
    // Note: API doesn't seem to have collections endpoint
    // This would need to be implemented in the backend or use a different approach
    const response = await api.get('/collections');
    
    if (response.data?.collections) {
      return { collections: response.data.collections };
    }
    if (Array.isArray(response.data)) {
      return { collections: response.data };
    }
    return { collections: [] };
  } catch (error) {
    console.error('Collections API call failed:', error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch collections');
  }
};

// Get product recommendations - No fallback, strict API validation
// Get general product recommendations - No fallback, strict API validation
export const getRecommendations = async (userId, limit = 8) => {
  try {
    const token = localStorage.getItem('token');
    let response;
    
    // If user is authenticated, try to get user-based recommendations
    if (token && userId) {
      try {
        // Use authenticated endpoint for personalized recommendations
        response = await api.get(`/products?limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (authError) {
        console.warn('Authenticated recommendations failed, falling back to general:', authError.message);
        // Fall back to general recommendations if auth fails
        response = await api.get(`/products?limit=${limit}`);
      }
    } else {
      // Use general products endpoint for non-authenticated users
      response = await api.get(`/products?limit=${limit}`);
    }
    
    // Extract products from API response
    let products = [];
    if (response.data?.products && Array.isArray(response.data.products)) {
      products = response.data.products;
    } else if (Array.isArray(response.data)) {
      products = response.data;
    }
    
    if (products.length === 0) {
      throw new Error('No recommendations available from API');
    }
    
    // Filter and validate products
    const validProducts = products.filter(product => 
      product && typeof product === 'object' && product.id && product.name
    );
    
    if (validProducts.length === 0) {
      throw new Error('No valid recommendations received from API');
    }
    
    // Enhance products and return requested amount
    const recommendations = validProducts.slice(0, limit).map(enhanceProduct);
    return { recommendations };
  } catch (error) {
    console.error('Recommendations API call failed:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch recommendations from API');
  }
};

// Get product-specific recommendations - For related products
export const getProductRecommendations = async (productId, limit = 8) => {
  try {
    const token = localStorage.getItem('token');
    let response;
    
    // First try product-specific recommendations if we have an authenticated user and product ID
    if (token && productId) {
      try {
        // Use authenticated product-specific recommendations endpoint
        response = await api.get(ENDPOINTS.PRODUCT_RECOMMENDATIONS(productId, limit), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Check if we got valid product-specific recommendations
        if (response.data?.products?.length > 0) {
          const products = response.data.products;
          const validProducts = products.filter(product => 
            product && 
            typeof product === 'object' && 
            product.id && 
            product.name &&
            product.id !== productId // Exclude current product
          );
          
          if (validProducts.length > 0) {
            const recommendations = validProducts.slice(0, limit).map(enhanceProduct);
            return { recommendations };
          }
        }
        
        if (import.meta.env.DEV) {
          console.log('Product-specific recommendations unavailable, using general products');
        }
      } catch {
        if (import.meta.env.DEV) {
          console.log('Product-specific endpoint unavailable, using general products');
        }
      }
    }
    
    // Fall back to general products endpoint with more robust handling
    try {
      response = await api.get(`/products?limit=${limit * 3}`); // Get more to filter out current product
    } catch {
      if (import.meta.env.DEV) {
        console.log('Using base products endpoint for recommendations');
      }
      // Try basic products endpoint as final fallback
      response = await api.get('/products');
    }
    
    // Extract products from API response with robust parsing
    let products = [];
    if (response.data?.products && Array.isArray(response.data.products)) {
      products = response.data.products;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      products = response.data.data;
    } else if (Array.isArray(response.data)) {
      products = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Check if it's a single product wrapped in an object
      const keys = Object.keys(response.data);
      if (keys.includes('id') && keys.includes('name')) {
        products = [response.data];
      }
    }
    
    console.log('Products fetched for recommendations:', products.length);
    
    if (products.length === 0) {
      // Try to get products using the basic getProducts function as absolute fallback
      try {
        const fallbackProducts = await getProducts({ limit: limit * 2 });
        products = fallbackProducts.products || [];
      } catch (fallbackError) {
        console.error('All recommendation fallbacks failed:', fallbackError);
      }
    }
    
    if (products.length === 0) {
      throw new Error('No product recommendations available from API');
    }
    
    // Filter out the current product and validate
    const validProducts = products.filter(product => 
      product && 
      typeof product === 'object' && 
      product.id && 
      product.name &&
      product.id !== productId // Exclude current product
    );
    
    if (validProducts.length === 0) {
      throw new Error('No valid product recommendations received from API');
    }
    
    // Enhance products and return requested amount
    const recommendations = validProducts.slice(0, limit).map(enhanceProduct);
    return { recommendations };
  } catch (error) {
    console.error('Product recommendations API call failed:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch product recommendations from API');
  }
};
