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

// Map names to Tailwind color families
const colorConfig = {
  "Identity": "blue",
  "Users": "indigo",
  "Profiles": "sky",
  "Content": "emerald",
  "Posts": "teal",
  "Comments": "cyan",
  "Commerce": "amber",
  "Orders": "orange",
  "Products": "rose"
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

export const getColorStyles = (name, isSelected = false) => {
  const color = colorConfig[name] || "slate";
  
  return {
    bg: isSelected ? `bg-${color}-500` : `bg-${color}-50`,
    text: isSelected ? "text-white" : `text-${color}-600`,
    border: isSelected ? `border-${color}-500` : `border-${color}-200`,
    accent: `text-${color}-400`,
    ring: `ring-${color}-500/10`,
    shadow: `shadow-${color}-500/20`
  };
};