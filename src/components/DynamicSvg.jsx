"use client";

import React, { useState, useEffect } from 'react';

/**
 * مكون يقوم بجلب أي أيقونة SVG ديناميكياً من محرك Iconify
 * يدعم الألوان، التكبير، والسرعة العالية دون الحاجة لاستيراد مكتبات
 */
export const DynamicSvg = ({ iconName, size = 24, className = "" }) => {
  const [svgContent, setSvgContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!iconName) return;

    // تحويل الاسم إلى التنسيق المطلوب (مثلاً fc:home أو mdi:account)
    const [prefix, name] = iconName.includes(':') ? iconName.split(':') : ['lucide', iconName];
    
    setLoading(true);
    fetch(`https://api.iconify.design/${prefix}/${name}.svg`)
      .then(res => res.text())
      .then(data => {
        // تنظيف الـ SVG وإضافة خصائص الحجم
        const processed = data
          .replace(/width="[^"]*"/, `width="${size}"`)
          .replace(/height="[^"]*"/, `height="${size}"`);
        setSvgContent(processed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [iconName, size]);

  if (loading) return <div style={{ width: size, height: size }} className="animate-pulse bg-slate-200 rounded-full" />;
  if (!svgContent) return null;

  return (
    <div 
      className={className}
      style={{ width: size, height: size, display: 'inline-flex' }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};