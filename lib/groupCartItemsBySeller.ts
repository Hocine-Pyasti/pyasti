import ICartItem from "../interfaces/ICartItem";

export function groupCartItemsBySeller(
  items: ICartItem[]
): Record<string, ICartItem[]> {
  return items.reduce((acc: Record<string, ICartItem[]>, item: ICartItem) => {
    const sellerId = item.seller.toString();
    if (!acc[sellerId]) {
      acc[sellerId] = [];
    }
    acc[sellerId].push(item);
    return acc;
  }, {});
}
