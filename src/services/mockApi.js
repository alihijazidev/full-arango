export const fetchMetadata = async () => {
  // Simulating network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    collections: [
      { name: "Users", category: "Identity", attributes: ["id", "name", "email", "age", "status"] },
      { name: "Profiles", category: "Identity", attributes: ["bio", "avatar", "lastLogin"] },
      { name: "Posts", category: "Content", attributes: ["title", "body", "createdAt", "views"] },
      { name: "Comments", category: "Content", attributes: ["text", "rating"] },
      { name: "Orders", category: "Commerce", attributes: ["orderId", "total", "currency", "status"] },
      { name: "Products", category: "Commerce", attributes: ["sku", "price", "stock"] },
    ],
    edges: [
      { name: "has_profile", from: "Users", to: "Profiles", attributes: ["since"] },
      { name: "authored", from: "Users", to: "Posts", attributes: ["role"] },
      { name: "commented_on", from: "Users", to: "Comments", attributes: ["isFlagged"] },
      { name: "belongs_to", from: "Comments", to: "Posts", attributes: [] },
      { name: "purchased", from: "Users", to: "Orders", attributes: ["paymentMethod"] },
      { name: "contains", from: "Orders", to: "Products", attributes: ["quantity"] },
    ],
  };
};