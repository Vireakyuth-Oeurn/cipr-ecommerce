
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { getProductImage } from "../utils/imageMapping";

export default function Recommended() {
  const [recommendeds, setrecommendeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = useNavigate();
  const { id } = useParams(); 

  useEffect(() => {
    const fetchrecommended = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found, please login.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("recommended Products", data);

        setrecommendeds(Array.isArray(data.recommended_products) ? data.recommended_products : []);
      } catch (err) {
        console.error("Error fetching recommended products", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchrecommended();
    }
  }, [id]);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const nextSlide = () => {
    if (currentIndex < recommendeds.length - 4) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const resolveCategory = (product) => {
    if (!product) return null;
    if (product.category) return String(product.category).toLowerCase();
    if (product.type) return String(product.type).toLowerCase();
    if (product.name) {
      const name = String(product.name).toLowerCase();
      const token = name.split(/[^a-z0-9]+/i)[0];
      return token || null;
    }
    return null;
  };

  if (loading) return <p>Loading recommendeds...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-gray-900">
           Recommended Product
          </h2>
        </div>

        {recommendeds.length > 4 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={currentIndex >= recommendeds.length - 4}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendeds
            .slice(currentIndex, currentIndex + 4)
            .map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                {/* Product Image (fallback to placeholder if no image) */}
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4">
                  <img
                    src={(() => {
                      const category = resolveCategory(product);
                      const apiImage = product.image || product.imageUrl || product.img || product.thumbnail || null;
                      return getProductImage(category, apiImage, product.id);
                    })()}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/placeholder-product.png';
                      console.warn('Recommendation image failed, using placeholder for product id:', product.id);
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      ${product.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="text-center pt-4">
        <button
          onClick={() => navigate("/products")}
          className="inline-flex items-center px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors font-medium"
        >
          View All Products
          <ArrowRight size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
}
