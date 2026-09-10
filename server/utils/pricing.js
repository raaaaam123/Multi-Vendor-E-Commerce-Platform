export const FREE_SHIPPING_THRESHOLD = 500;
export const SHIPPING_FLAT_RATE = 50;
export const TAX_RATE = 0.18;

export const round2 = (value) =>
  Number((Math.round(value * 100) / 100).toFixed(2));

export const computeItemPrice = (product) => {
  const price = Number(product.price) || 0;
  const discountRate = Math.min(100, Math.max(0, Number(product.discount) || 0));
  const finalPrice = round2(price * (1 - discountRate / 100));
  const saving = round2(price - finalPrice);
  return { price, discountRate, finalPrice, saving };
};

export const computeShipping = (subtotal) => {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
};

export const computeTax = (subtotal) => round2(subtotal * TAX_RATE);

export const computeCartTotals = (items, coupon = null) => {
  let mrpTotal = 0;
  let subtotal = 0;
  let productDiscount = 0;
  let totalQuantity = 0;

  for (const item of items) {
    const quantity = Number(item.quantity) || 0;
    const { price, finalPrice, saving } = computeItemPrice(item.product || {});
    mrpTotal += price * quantity;
    subtotal += finalPrice * quantity;
    productDiscount += saving * quantity;
    totalQuantity += quantity;
  }

  mrpTotal = round2(mrpTotal);
  subtotal = round2(subtotal);
  productDiscount = round2(productDiscount);

  const couponDiscount = coupon ? round2(coupon.discountAmount) : 0;
  const shipping = computeShipping(subtotal);
  const tax = computeTax(subtotal);
  const total = round2(subtotal - couponDiscount + shipping + tax);

  return {
    mrpTotal,
    productDiscount,
    couponDiscount,
    discount: round2(productDiscount + couponDiscount),
    subtotal,
    shipping,
    tax,
    total,
    totalQuantity,
  };
};