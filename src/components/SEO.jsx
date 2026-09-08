import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Ergani Yıldız Spor Futbol Kulübü';
const SITE_URL = 'https://www.erganiyildizspor.com.tr';
const DEFAULT_DESCRIPTION =
  'Ergani Yıldız Spor Futbol Kulübü resmi web sitesi. 2009\'dan bu yana Ergani, Diyarbakır\'da futbol altyapısı, amatör lig maçları, kulüp haberleri ve duyuruları.';
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

/**
 * SEO Component — Her sayfada kullanılır.
 *
 * Neden bu kadar kapsamlı?
 * ─────────────────────────
 * React Helmet, <head> tag'lerini JavaScript ile günceller.
 * Google Bot modern sayfaları render edebildiği için bu tag'leri okuyabilir.
 * Ama asıl kritik olan index.html'deki statik tag'lerdir (JS olmadan da görünür).
 * Bu component, sayfa değiştikçe meta bilgilerini günceller.
 *
 * Props:
 *   title       — Sayfa başlığı (site adı otomatik eklenir)
 *   description — Sayfa açıklaması
 *   image       — OG paylaşım resmi (absolute URL)
 *   type        — og:type (varsayılan: 'website')
 *   noIndex     — true ise sayfayı Google indexlemesin (admin sayfaları için)
 *   jsonLd      — Ekstra JSON-LD structured data objesi
 */
export default function SEO({
  title,
  description,
  image,
  type = 'website',
  noIndex = false,
  jsonLd,
}) {
  const location = useLocation();

  const finalTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Resmi Web Sitesi`;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalImage = image || DEFAULT_IMAGE;
  const canonicalUrl = `${SITE_URL}${location.pathname}`;

  return (
    <Helmet>
      {/* ─── Temel SEO ─── */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* ─── Open Graph ─── */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:locale" content="tr_TR" />

      {/* ─── Twitter Card ─── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* ─── Ekstra JSON-LD (sayfa bazlı) ─── */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
