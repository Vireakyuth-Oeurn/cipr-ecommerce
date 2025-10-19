import { useNavigate } from "react-router-dom";

export default function PurchaseDialog({ show }) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="text-center">
          <svg
            className="mx-auto mb-4 text-gray-400 w-12 h-12"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 11V6m0 8h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0Z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Please login to view your purchase history
          </h3>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
