import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, image, url, type = 'website' }) {
  const siteName = 'Ergani Yıldız Spor';
  const defaultDescription = 'Ergani Yıldız Spor Kulübü - Bölgenin Parlayan Yıldızı. Altyapı ve A Takım futbol faaliyetlerimiz ile Ergani\'yi temsil ediyoruz.';
  const defaultImage = 'https://yildiz-spor.vercel.app/slider1.jpg'; // Varsayılan kapak fotoğrafı
  const defaultUrl = 'https://yildiz-spor.vercel.app';

  const finalTitle = title ? `${title} | ${siteName}` : siteName;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const finalUrl = url ? `${defaultUrl}${url}` : defaultUrl;

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={finalUrl} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={finalImage} />
    </Helmet>
  );
}
