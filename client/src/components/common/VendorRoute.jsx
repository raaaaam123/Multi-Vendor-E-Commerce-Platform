import ProtectedRoute from "./ProtectedRoute";

const VendorRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["vendor"]}>{children}</ProtectedRoute>
  );
};

export default VendorRoute;
