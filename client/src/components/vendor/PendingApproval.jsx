const PendingApproval = ({ status = "pending" }) => {
  const rejected = status === "rejected";

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-md text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            rejected ? "bg-red-50" : "bg-yellow-50"
          }`}
        >
          <svg
            className={`w-8 h-8 ${rejected ? "text-red-500" : "text-yellow-500"}`}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {rejected ? (
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {rejected
            ? "Vendor Application Rejected"
            : "Account Pending Approval"}
        </h2>
        <p className="text-gray-600 mb-6">
          {rejected
            ? "Your vendor application was not approved. Please contact support to discuss your application or re-apply after updating your business details."
            : "Your vendor account is awaiting approval from an administrator. Your store will become active once approved. This usually takes a short time."}
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
          {rejected
            ? "You can update your business information and contact an admin for re-review."
            : "You will be able to start selling as soon as your account is approved."}
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;