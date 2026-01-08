export const fetchMetadata = async () => {
  // محاكاة تأخير الشبكة
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    collections: [ // هذه تمثل الفئات (Categories)
      {
        name: "Identity",
        attributes: ["created_at", "source_system"],
        entities: [ // هذه تمثل المجموعات (Collections)
          { name: "Users", attributes: ["id", "name", "email", "age", "status"] },
          { name: "Profiles", attributes: ["bio", "avatar", "lastLogin"] }
        ]
      },
      {
        name: "Content",
        attributes: ["app_version"],
        entities: [
          { name: "Posts", attributes: ["title", "body", "createdAt", "views"] },
          { name: "Comments", attributes: ["text", "rating"] }
        ]
      },
      {
        name: "Commerce",
        attributes: ["region"],
        entities: [
          { name: "Orders", attributes: ["orderId", "total", "currency", "status"] },
          { name: "Products", attributes: ["sku", "price", "stock"] }
        ]
      }
    ],
    edges: [
      { label: "has_profile", fromcol: "Identity/Users", tocol: "Identity/Profiles", attributes: ["since"] },
      { label: "authored", fromcol: "Identity/Users", tocol: "Content/Posts", attributes: ["role"] },
      { label: "commented_on", fromcol: "Identity/Users", tocol: "Content/Comments", attributes: ["isFlagged"] },
      { label: "belongs_to", fromcol: "Content/Comments", tocol: "Content/Posts", attributes: [] },
      { label: "purchased", fromcol: "Identity/Users", tocol: "Commerce/Orders", attributes: ["paymentMethod"] },
      { label: "contains", fromcol: "Commerce/Orders", tocol: "Commerce/Products", attributes: ["quantity"] }
    ]
  };
};