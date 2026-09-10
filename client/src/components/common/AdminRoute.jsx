import ProtectedRoute from "./ProtectedRoute";

const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
  );
};

export default AdminRoute;
