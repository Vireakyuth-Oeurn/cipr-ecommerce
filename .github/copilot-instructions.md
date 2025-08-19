# CIPR E-commerce Frontend - AI Agent Instructions

## Project Overview
React 19 + Vite e-commerce frontend with Tailwind CSS, featuring product browsing, cart functionality, authentication, and AI-powered recommendations.

## Critical Architecture Patterns

### Dual Context Architecture
- **AppContext** (`src/Context/AppContext.jsx`) - Global auth state with localStorage persistence
- **CartContext** (`src/context/CartContext.jsx`) - Cart state management with API integration
- Import paths: `../Context/AppContext` (capitalized) vs `../context/CartContext` (lowercase)
- Authentication flow: token → API call → user object → localStorage sync
- Cart flow: API calls → enhanced product data → React context → UI updates

### API Integration with Enhanced Error Handling
- **Primary API**: `https://cipr-api.panhayuthoeun.codes` (proxied via `/api` in dev)
- **Services pattern**: `src/api/services.js` with comprehensive error handling and fallbacks
- **Cart enhancement**: `getCart()` fetches products and enhances with local images/data  
- **Graceful degradation**: API failures return safe defaults instead of throwing errors
- **Development debugging**: Console logging enabled via `import.meta.env.DEV`

### Local Image System
- **Image mapping**: `src/utils/imageMapping.js` maps categories to local images in `public/images/`
- **Multi-format support**: PNG, AVIF, WebP, JPG based on category
- **Category coverage**: 20+ images across t-shirts, jackets, shoes, pants, etc.
- **Fallback strategy**: Unknown categories default to t-shirt images

### Component Architecture
- **Compound components**: Many components accept children and use composition
- **Loading states**: Use skeleton loading with Tailwind animations (`animate-pulse`)
- **Error boundaries**: Global ErrorBoundary component catches React errors
- **Toast system**: Custom toast implementation via `SimpleToaster` + `useToast` hook

## Development Workflows

### Essential Commands
```bash
npm run dev          # Start with API proxy to cipr-api.panhayuthoeun.codes
npm run build        # Production build
npm run preview      # Preview production build locally
npm run lint         # ESLint check
```

### Key Development Patterns

#### Cart Integration Pattern
```jsx
// Always use cart context for cart operations
import { useCart } from '../hooks/useCart';

const { cartItems, cartCount, loading, fetchCart, addItemToCart } = useCart();

// Add to cart with context refresh
const handleAddToCart = async () => {
  await addToCart(product.id, 1);  // API call
  await fetchCart();               // Refresh context
  showToast('Added to cart!', 'success');
};
```

#### Authentication + Cart State Pattern
```jsx
// Cart automatically syncs with auth state
const { isAuthenticated } = useContext(AppContext);
const { cartItems, fetchCart } = useCart();

// Cart clears on logout, fetches on login
useEffect(() => {
  if (isAuthenticated) {
    fetchCart();
  } else {
    // Cart context automatically clears
  }
}, [isAuthenticated]);
```

#### Enhanced Product Data Pattern
```jsx
// Products enhanced with local images and ratings
const enhanceProduct = (product) => ({
  ...product,
  image: getProductImage(product.category, product.id),
  rating: Math.random() * 2 + 3, // 3-5 stars
  reviewCount: Math.floor(Math.random() * 200) + 10
});
```

## Project-Specific Conventions

### Context Provider Hierarchy
```jsx
// App.jsx provider nesting (CRITICAL ORDER)
<AppProvider>          // Auth context first
  <ErrorBoundary>
    <CartProvider>     // Cart context second (needs auth)
      <Router>
        <Routes>...</Routes>
        <SimpleToaster />
      </Router>
    </CartProvider>
  </ErrorBoundary>
</AppProvider>
```

### Route Architecture  
- **Public routes**: Wrapped in `<MainLayout>` (home, products, collections)
- **Auth routes**: No layout (login, register) with conditional redirects
- **Cart route**: Protected via context, not route guards
- **Route protection**: `element={user ? <Home/> : <LoginPage />}` pattern

### API Service Error Handling
```jsx
// Never throw errors in cart services - always return safe data
export const getCart = async () => {
  try {
    // Try enhanced cart with product details
    const enhancedItems = await enhanceCartItems(cartItems);
    return { items: enhancedItems };
  } catch (enhancementError) {
    // Fall back to basic cart items
    return { items: basicCartItems };
  } catch (apiError) {
    // Final fallback to empty cart
    return { items: [] };
  }
};
```

## Integration Points

### External Services
- **CIPR API**: Laravel backend with comprehensive e-commerce endpoints
  - Auth: `/api/login`, `/api/register`, `/api/user`, `/api/logout`
  - Products: `/api/products`, `/api/products/{id}` (public)
  - Cart: `/api/cart` (CRUD operations, requires auth)  
  - Sales: `/api/sales` (purchase history/checkout, requires auth)
- **Local Images**: Category-based mapping to `public/images/` folder
- **Toast System**: `SimpleToaster` with `useErrorHandler` hook integration

### Cart State Synchronization
- **API → Context → UI**: Cart changes flow through context to update navbar badge
- **Authentication sync**: Cart auto-clears on logout, fetches on login
- **Error resilience**: Failed API calls don't break cart functionality
- **Development debugging**: Console logs track cart state changes

## Common Gotchas

### Context Import Paths
- AppContext: `import { AppContext } from '../Context/AppContext'` (capitalized folder)
- CartContext: `import { useCart } from '../hooks/useCart'` (lowercase folder)

### Cart Integration Requirements
- Always call `fetchCart()` after successful `addToCart()` API calls
- Cart context automatically handles authentication state changes
- Use `cartCount` from context, not manual calculations
- Cart loading state managed automatically by context

### API Response Handling
- Cart API returns various formats: `response.data.items`, `response.data`, or `response`
- Product enhancement may fail - services provide safe fallbacks
- Development logs enabled only in dev mode: `if (import.meta.env.DEV)`
- Authentication errors (401) automatically clear cart state

### Image System
- Local images override API images for better performance/reliability
- Category mapping in `imageMapping.js` supports fallbacks and multiple formats
- Images stored in `public/images/` with category-based organization
- Unknown categories fallback to t-shirt images for consistency
