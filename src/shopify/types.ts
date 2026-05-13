export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  variants: {
    edges: Array<{
      node: ShopifyVariant;
    }>;
  };
  images: {
    edges: Array<{
      node: { url: string; altText: string | null };
    }>;
  };
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: ShopifyMoney;
  availableForSale: boolean;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: ShopifyMoney;
    product: { title: string };
  };
}

export interface ShopifyUserError {
  field: string[];
  message: string;
}

export interface CartCreateResponse {
  cartCreate: { cart: ShopifyCart; userErrors: ShopifyUserError[] };
}

export interface CartLinesAddResponse {
  cartLinesAdd: { cart: ShopifyCart; userErrors: ShopifyUserError[] };
}

export interface CartLinesUpdateResponse {
  cartLinesUpdate: { cart: ShopifyCart; userErrors: ShopifyUserError[] };
}

export interface CartLinesRemoveResponse {
  cartLinesRemove: { cart: ShopifyCart; userErrors: ShopifyUserError[] };
}
