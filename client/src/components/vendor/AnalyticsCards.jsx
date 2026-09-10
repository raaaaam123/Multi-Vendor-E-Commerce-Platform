import { formatCurrency } from "../../utils/format";

const StatCard = ({ title, value, sub, icon, color }) => {
  const colorClasses = {
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            colorClasses[color] || colorClasses.purple
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
            <path d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
};

const AnalyticsCards = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse"
          >
            <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalRevenue = (analytics.dailySales || []).reduce(
    (sum, day) => sum + (day.revenue || 0),
    0
  );
  const totalUnits = (analytics.dailySales || []).reduce(
    (sum, day) => sum + (day.units || 0),
    0
  );
  const topProduct = analytics.topProducts?.[0];
  const shippedCount = (analytics.ordersByStatus || []).find(
    (s) => s._id === "shipped"
  )?.count;
  const deliveredCount = (analytics.ordersByStatus || []).find(
    (s) => s._id === "delivered"
  )?.count;

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      color: "green",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "Units Sold",
      value: totalUnits,
      color: "blue",
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    },
    {
      title: "Delivered Orders",
      value: (deliveredCount || 0) + (shippedCount || 0),
      color: "purple",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      title: topProduct ? "Top Product" : "Top Product",
      value: topProduct ? formatCurrency(topProduct.revenue || 0) : "—",
      sub: topProduct?.name ? `${topProduct.name} (${topProduct.totalSold} sold)` : "No sales yet",
      color: "orange",
      icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default AnalyticsCards;