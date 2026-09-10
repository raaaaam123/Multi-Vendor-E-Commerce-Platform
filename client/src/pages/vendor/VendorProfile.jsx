import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVendorProfile,
  updateVendorProfile,
  clearVendorError,
} from "../../redux/slices/vendorSlice";
import StatusBadge from "../../components/admin/StatusBadge";
import PendingApproval from "../../components/vendor/PendingApproval";

const VendorProfile = () => {
  const dispatch = useDispatch();
  const { profile, loading, actionLoading, actionError, approvalStatus } =
    useSelector((state) => state.vendor);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    businessAddress: "",
    businessDescription: "",
  });

  useEffect(() => {
    dispatch(fetchVendorProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        businessName: profile.businessName || "",
        businessAddress: profile.businessAddress || "",
        businessDescription: profile.businessDescription || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    return () => dispatch(clearVendorError());
  }, [dispatch]);

  if (approvalStatus === "pending" || approvalStatus === "rejected")
    return <PendingApproval status={approvalStatus} />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateVendorProfile(formData));
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading && !profile) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {actionError}
        </div>
      )}
      {actionLoading && <div className="text-sm text-gray-500">Saving...</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {formData.name?.charAt(0)?.toUpperCase() || "V"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
              <p className="text-sm text-gray-500">{formData.email}</p>
            </div>
          </div>
          <StatusBadge status={approvalStatus || "approved"} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                disabled
                value={formData.email}
                onChange={handleChange}
                className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Business Name</label>
            <input
              type="text"
              name="businessName"
              required
              value={formData.businessName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Business Address</label>
            <input
              type="text"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              className={inputClass}
              placeholder="Street, City, State, PIN"
            />
          </div>

          <div>
            <label className={labelClass}>Business Description</label>
            <textarea
              name="businessDescription"
              rows="3"
              value={formData.businessDescription}
              onChange={handleChange}
              className={inputClass}
              placeholder="Tell customers about your business..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProfile;
