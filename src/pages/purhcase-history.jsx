import { useEffect, useState } from "react";
import PurchaseDialog from "../components/purchase-dialog";

export default function PurchaseHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setShowDialog(true);
        setLoading(false);
        return;
      }

      try {
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
        setHistory(Array.isArray(data.sales) ? data.sales : []);
      } catch (err) {
        console.error("Error fetching sales history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <p>Loading...</p>;

  const tableHeaders = [
    "Product ID",
    "Name",
    "Description",
    "Quantity",
    "Price",
    "Sale Date",
  ];

  return (
    <div className="p-4 sm:p-12">
      <h1 className="text-2xl font-bold p-4 text-center">PURCHASE HISTORY</h1>

      {/* Dialog popup */}
      <PurchaseDialog show={showDialog} onClose={() => setShowDialog(false)} />

      {!showDialog && (
        <>
          {history.length === 0 ? (
            <p className="p-4">No order history found.</p>
          ) : (
            <div className="my-5 shadow-sm rounded-lg overflow-hidden">
              {/* Table for larger screens */}
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
                      className="bg-white border-b hover:bg-gray-50"
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

              {/* Mobile card view */}
              <div className="md:hidden">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border-b border-gray-200 p-4 mb-4 rounded-lg shadow"
                  >
                    <p>
                      <strong>ID:</strong> {item.product.id}
                    </p>
                    <p>
                      <strong>Name:</strong> {item.product.name}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {item.product.description?.join(", ")}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {item.quantity}
                    </p>
                    <p>
                      <strong>Price:</strong> ${item.product.price}
                    </p>
                    <p>
                      <strong>Date:</strong> {item.sale_date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
