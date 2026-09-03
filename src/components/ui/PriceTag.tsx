interface PriceTagProps {
  price: number;
  oldPrice?: number | null;
  className?: string;
}

function formatPrice(price: number) {
  return `${price.toLocaleString("ru-RU")} ₸`;
}

export function PriceTag({ price, oldPrice, className }: PriceTagProps) {
  const hasDiscount = oldPrice !== null && oldPrice !== undefined && oldPrice > price;

  return (
    <span className={`inline-flex items-baseline gap-2 whitespace-nowrap ${className ?? ""}`.trim()}>
      {hasDiscount && <span className="text-foreground-subtle line-through">{formatPrice(oldPrice)}</span>}
      <span className={hasDiscount ? "font-semibold text-accent" : "font-semibold text-foreground"}>
        {formatPrice(price)}
      </span>
    </span>
  );
}
