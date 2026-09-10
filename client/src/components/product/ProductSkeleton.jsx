const ProductSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="aspect-square bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="h-9 bg-gray-200 rounded w-24" />
      </div>
    </div>
  </div>
);

export default ProductSkeleton;
