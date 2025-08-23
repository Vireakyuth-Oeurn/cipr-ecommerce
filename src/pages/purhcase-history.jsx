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
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="relative overflow-x-auto sm:rounded-lg p-12">
      <h1 className="text-xl font-bold p-4">PURCHASE HISTORY</h1>
      {history.length === 0 ? (
        <p className="p-4">No order history found.</p>
      ) : (
        <table className="w-full p-4 text-sm text-left text-black my-5">
          <thead className="text-xs uppercase text-black bg-gray-100 ">
            <tr>
              <th scope="col" className="px-6 py-3">
                Product ID
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th scope="col" className="px-6 py-3">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3">
                Price
              </th>
              <th scope="col" className="px-6 py-3">
                Sale Date
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr
                key={item.id}
                className="border-b bg-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 shadow-sm"
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
      )}
    </div>
  );
}
