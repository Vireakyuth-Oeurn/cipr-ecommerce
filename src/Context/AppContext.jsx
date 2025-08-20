import { createContext, useEffect, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export default function AppProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    return localStorage.getItem("token");
  });
  const [user, setUser] = useState(null);

  const setToken = (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      console.log("is token save?", newToken);
      setTokenState(newToken);
    } else {
      localStorage.removeItem("token");
      setTokenState(null);
    }
  };

  async function getUser() {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("User API Response:", data); 
      
      let userData = null;
      if (data && data.user) {
        userData = data.user;
      } else if (data && (data.id || data.name || data.email)) {
        userData = data;
      }
      
      if (userData) {
        console.log("Setting user data:", userData);
        setUser(userData);
      } else {
        console.warn("Invalid user data received:", data);
        handleAuthError();
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      handleAuthError();
    }
  }

  const handleAuthError = () => {
    setUser(null);
    setToken(null); 
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    if (token) {
      getUser();
    } else {
      setUser(null);
    }
  }, [token]);

  return (
    <AppContext.Provider value={{ 
      token, 
      setToken, 
      user, 
      setUser,
      logout,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AppContext.Provider>
  );
}