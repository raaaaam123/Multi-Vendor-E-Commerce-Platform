const CouponMessage = ({ type = "info", message }) => {
  if (!message) return null;

  const styles = {
    success: {
      container: "bg-green-50 border-green-200 text-green-700",
      icon: null,
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-700",
      icon: null,
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-700",
      icon: null,
    },
  }[type] || {
    container: "bg-gray-50 border-gray-200 text-gray-700",
    icon: null,
  };

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${styles.container}`}
    >
      {message}
    </div>
  );
};

export default CouponMessage;