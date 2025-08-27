import { useEffect, useState } from "react";

export default function PurchaseHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token"); 
        if (!token) {
          setError("Please login.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/sales`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("API response:", data);
        setHistory(Array.isArray(data.sales) ? data.sales : []);
      } catch (err) {
        console.error("Error fetching sales history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Tailwind CSS classes for responsive table styling
  const tableHeaders = ["Product ID", "Name", "Description", "Quantity", "Price", "Sale Date"];

  return (
    <div className="p-4 sm:p-12">
      <h1 className="text-2xl font-bold p-4 text-center">PURCHASE HISTORY</h1>
      {history.length === 0 ? (
        <p className="p-4">No order history found.</p>
      ) : (
        <div className="my-5 shadow-sm rounded-lg overflow-hidden">
          {/* Traditional table view for larger screens */}
          <table className="w-full text-sm text-left text-gray-800 hidden md:table">
            <thead className="text-xs uppercase text-gray-800 bg-gray-100">
              <tr>
                {tableHeaders.map((header) => (
                  <th key={header} scope="col" className="px-6 py-3">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr
                  key={item.id}
                  className="bg-white border-b dark:border-gray-700 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">{item.product.id}</td>
                  <td className="px-6 py-4">{item.product.name}</td>
                  <td className="px-6 py-4">
                    {item.product.description?.join(", ")}
                  </td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">${item.product.price}</td>
                  <td className="px-6 py-4">{item.sale_date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Stacked card view for mobile screens */}
          <div className="md:hidden">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white border-b border-gray-200 p-4 mb-4 rounded-lg shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-500">Product ID:</span>
                  <span className="text-right">{item.product.id}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-500">Name:</span>
                  <span className="text-right">{item.product.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-500">Description:</span>
                  <span className="text-right">{item.product.description?.join(", ")}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-500">Quantity:</span>
                  <span className="text-right">{item.quantity}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-500">Price:</span>
                  <span className="text-right">${item.product.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-500">Sale Date:</span>
                  <span className="text-right">{item.sale_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
