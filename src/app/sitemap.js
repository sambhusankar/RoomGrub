export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
  ];
}
