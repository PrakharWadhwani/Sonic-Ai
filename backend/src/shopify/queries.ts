export const PRODUCTS_QUERY = `
  query Products($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          descriptionHtml
          handle
          tags
          variants(first: 5) {
            edges {
              node {
                id
                title
                price
              }
            }
          }
          images(first: 3) {
            edges {
              node { url altText }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      handle
      variants(first: 10) {
        edges {
          node {
            id
            title
            price { amount currencyCode }
            availableForSale
          }
        }
      }
      images(first: 5) {
        edges {
          node { url altText }
        }
      }
    }
  }
`;
