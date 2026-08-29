import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { 
        loginUser,
        getCurrentUser,
 } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore login after page refresh
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken =
        localStorage.getItem("threadly_token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const currentUser =
          await getCurrentUser(storedToken);

        setToken(storedToken);
        setUser(currentUser);

        localStorage.setItem(
          "threadly_user",
          JSON.stringify(currentUser)
        );
      } catch (error) {
        console.error(
          "Session restoration failed:",
          error
        );

        localStorage.removeItem(
          "threadly_token"
        );

        localStorage.removeItem(
          "threadly_user"
        );

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({
      email,
      password,
    });

    setToken(data.token);
    setUser(data.user);

    
    localStorage.setItem(
      "threadly_token",
      data.token
    );

    localStorage.setItem(
      "threadly_user",
      JSON.stringify(data.user)
    );

    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(
      "threadly_token"
    );

    localStorage.removeItem(
      "threadly_user"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
