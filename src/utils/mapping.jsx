import React from 'react';
import { 
  User, 
  UserCircle, 
  Fingerprint, 
  FileText, 
  MessageSquare, 
  MessageCircle, 
  ShoppingBag, 
  ShoppingCart, 
  Package,
  FolderTree,
  Database,
  HelpCircle,
  Layout
} from 'lucide-react';

export const nameMapping = {
  // Categories
  "Identity": "الهوية",
  "Content": "المحتوى",
  "Commerce": "التجارة",
  
  // Collections
  "Users": "المستخدمون",
  "Profiles": "الملفات الشخصية",
  "Posts": "المنشورات",
  "Comments": "التعليقات",
  "Orders": "الطلبات",
  "Products": "المنتجات"
};

const iconConfig = {
  // Categories
  "Identity": Fingerprint,
  "Content": FileText,
  "Commerce": ShoppingBag,
  
  // Collections
  "Users": User,
  "Profiles": UserCircle,
  "Posts": MessageSquare,
  "Comments": MessageCircle,
  "Orders": ShoppingCart,
  "Products": Package
};

export const getArabicName = (name) => nameMapping[name] || name;

export const getIcon = (name, type = 'collection') => {
  const IconComponent = iconConfig[name];
  if (IconComponent) return <IconComponent size={20} />;
  return type === 'category' ? <FolderTree size={20} /> : <Database size={20} />;
};

export const getSmallIcon = (name, type = 'collection') => {
  const IconComponent = iconConfig[name];
  if (IconComponent) return <IconComponent size={14} />;
  return type === 'category' ? <FolderTree size={14} /> : <Database size={14} />;
};