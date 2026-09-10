import { Outlet } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";
import VendorHeader from "./VendorHeader";

const VendorLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <VendorSidebar />
      <div className="lg:pl-64">
        <VendorHeader />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
