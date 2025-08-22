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
    console.log('🛒 Fetching cart...');
    const response = await api.get('/cart');
    console.log('🛒 Raw cart response:', response.data);
    const cartData = response.data;
    
    let cartItems = [];
    
    if (cartData.cart && Array.isArray(cartData.cart)) {
      cartItems = cartData.cart;
    } else if (cartData.items && Array.isArray(cartData.items)) {
      cartItems = cartData.items;
    } else if (Array.isArray(cartData)) {
      cartItems = cartData;
    }

    console.log('🛒 Extracted cart items:', cartItems.length);

    // Validate and enhance cart items
    const validItems = cartItems.filter(item => 
      item && 
      typeof item === 'object' && 
      item.id && 
      item.product_id &&
      item.quantity
    );

    console.log('🛒 Valid cart items:', validItems.length);

    // Enhance cart items with product details and images
    const enhancedItems = await Promise.allSettled(
      validItems.map(async (item) => {
        try {
          // Use the product data that's already included in the response
          let productDetails = item.product;
          
          // If product details aren't included, fetch them
          if (!productDetails) {
            console.log(`🛒 Fetching product details for ${item.product_id}`);
            const productResponse = await api.get(`/products/${item.product_id}`);
            productDetails = productResponse.data.product || productResponse.data;
          }

          // Enhance the product with local image
          const enhancedProduct = enhanceProduct(productDetails);

          return {
            ...item,
            product: enhancedProduct,
            // Ensure we have the required fields
            cartItemId: item.id,
            productId: item.product_id || productDetails.id,
            quantity: item.quantity,
            price: productDetails.price,
            name: productDetails.name,
            image: enhancedProduct.image || enhancedProduct.imageUrl
          };
        } catch (error) {
          console.warn(`🛒 Failed to enhance cart item ${item.id}:`, error.message);
          // Return basic cart item without enhancement
          return {
            ...item,
            product: item.product || {
              id: item.product_id,
              name: `Product ${item.product_id}`,
              price: 0,
              image: '/images/placeholder.png'
            },
            cartItemId: item.id,
            productId: item.product_id,
            quantity: item.quantity,
            price: item.product?.price || 0,
            name: item.product?.name || `Product ${item.product_id}`,
            image: '/images/placeholder.png'
          };
        }
      })
    );

    // Extract successful enhancements
    const safeItems = enhancedItems
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    console.log('🛒 Successfully enhanced cart items:', safeItems.length);

    return {
      items: safeItems,
      total: safeItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
    };

  } catch (error) {
    console.error('🛒 Cart fetch failed:', error);
    
    // Return empty cart structure instead of throwing
    return {
      items: [],
      total: 0
    };
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
// export const getProducts = async (limit = 20) => {
//   try {
//     const response = await api.get(`${import.meta.env.VITE_API_URL}/products`, { params: { limit } });

//     // Try to extract products from all possible fields
//     let allProducts = [];
//     if (response.data.products) {
//       allProducts = response.data.products;
//     } else if (response.data.latest_products || response.data.best_selling_products || response.data.recommended_products) {
//       allProducts = [
//         ...(response.data.latest_products || []),
//         ...(response.data.best_selling_products || []),
//         ...(response.data.recommended_products || [])
//       ];
//     } else if (Array.isArray(response.data)) {
//       allProducts = response.data;
//     }

//     const validProducts = allProducts.filter(
//       (product) => product && typeof product === 'object' && product.id
//     );

//     if (validProducts.length === 0) {
//       throw new Error('No valid products received from API');
//     }

//     const enhancedProducts = validProducts.map(enhanceProduct);

//     return {
//       all: enhancedProducts
//     };
//   } catch (error) {
//     console.error('Products API call failed:', error.message);
//     throw new Error(
//       error.response?.data?.message ||
//       error.message ||
//       'Failed to fetch products from API'
//     );
//   }
// };

export const getProducts = async (limit = 20) => {
  try {
    console.log('🔍 Fetching products from API...');
    const response = await api.get(`${ENDPOINTS.PRODUCTS}?limit=${limit}`);
    
    console.log('📦 Raw API response:', response.data);
    
    // Handle multiple possible response formats
    let allProducts = [];
    
    // Check if API returns categorized products (your current expected format)
    if (response.data.latest_products || response.data.best_selling_products || response.data.recommended_products) {
      const latest = response.data.latest_products || [];
      const bestSelling = response.data.best_selling_products || [];
      const recommended = response.data.recommended_products || [];
      
      allProducts = [...latest, ...bestSelling, ...recommended];
      
      console.log('📊 Found categorized products:', {
        latest: latest.length,
        bestSelling: bestSelling.length,
        recommended: recommended.length,
        total: allProducts.length
      });
    }
    // Check if API returns simple products array
    else if (response.data.products && Array.isArray(response.data.products)) {
      allProducts = response.data.products;
      console.log('📦 Found products array:', allProducts.length);
    }
    // Check if API returns direct array
    else if (Array.isArray(response.data)) {
      allProducts = response.data;
      console.log('📦 Found direct array:', allProducts.length);
    }
    // Check for other possible structures
    else if (response.data.data && Array.isArray(response.data.data)) {
      allProducts = response.data.data;
      console.log('📦 Found nested data array:', allProducts.length);
    }
    
    // Filter out invalid products
    const validProducts = allProducts.filter(
      (product) => product && typeof product === 'object' && (product.id || product._id)
    );
    
    console.log('✅ Valid products after filtering:', validProducts.length);
    
    if (validProducts.length === 0) {
      console.warn('⚠️ No valid products found in API response');
      return {
        latest_products: [],
        best_selling_products: [],
        recommended_products: [],
        all: []
      };
    }
    
    // Enhance products with local images
    const enhancedProducts = validProducts.map(enhanceProduct);
    
    // For backward compatibility, distribute products across categories if not categorized
    if (!response.data.latest_products && !response.data.best_selling_products && !response.data.recommended_products) {
      const chunkSize = Math.ceil(enhancedProducts.length / 3);
      return {
        latest_products: enhancedProducts.slice(0, chunkSize),
        best_selling_products: enhancedProducts.slice(chunkSize, chunkSize * 2),
        recommended_products: enhancedProducts.slice(chunkSize * 2),
        all: enhancedProducts
      };
    }
    
    // Return original categorized structure
    return {
      latest_products: (response.data.latest_products || []).map(enhanceProduct),
      best_selling_products: (response.data.best_selling_products || []).map(enhanceProduct),
      recommended_products: (response.data.recommended_products || []).map(enhanceProduct),
      all: enhancedProducts
    };
    
  } catch (error) {
    console.error('❌ Products API call failed:', error);
    console.error('📋 Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
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
export const searchProducts = async (search, limit = 10) => {
  try {
    const response = await api.get(ENDPOINTS.PRODUCT_SEARCH, {
      params: {
        search: search,
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

