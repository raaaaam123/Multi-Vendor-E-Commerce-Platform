import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../common/Header";
import Footer from "../common/Footer";
import ScrollToTop from "../common/ScrollToTop";
import { fetchCart, resetCart } from "../../redux/slices/cartSlice";
import { fetchWishlist, resetWishlist } from "../../redux/slices/wishlistSlice";
import { resetMyOrders } from "../../redux/slices/orderSlice";

const MainLayout = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    } else {
      dispatch(resetCart());
      dispatch(resetWishlist());
      dispatch(resetMyOrders());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;