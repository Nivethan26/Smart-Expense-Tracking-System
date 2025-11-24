import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  // While loading user from localStorage, avoid redirect
  if (user === null) {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      return <div className="p-10 text-center">Loading...</div>;
    }
  }

  // If no user even after checking → redirect
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
