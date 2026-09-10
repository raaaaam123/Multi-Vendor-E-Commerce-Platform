import { Link } from "react-router-dom";

const AddressSelector = ({ addresses, selectedId, onChange }) => {
  if (addresses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-600 text-sm mb-4">
          No shipping addresses found.
        </p>
        <Link
          to="/addresses"
          className="inline-flex bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Add an Address
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <label
          key={address._id}
          className={`block cursor-pointer rounded-xl border-2 p-4 transition-colors ${
            selectedId === address._id
              ? "border-indigo-600 bg-indigo-50/50"
              : "border-gray-100 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="shippingAddress"
              checked={selectedId === address._id}
              onChange={() => onChange(address._id)}
              className="mt-1 accent-indigo-600"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {address.fullName}
                </span>
                {address.isDefault && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ""}
              </p>
              <p className="text-sm text-gray-600">
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p className="text-sm text-gray-600">
                {address.country} · {address.phone}
              </p>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
};

export default AddressSelector;