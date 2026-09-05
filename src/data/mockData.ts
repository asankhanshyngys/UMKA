export const currency = "₸";

export function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU")} ${currency}`;
}
