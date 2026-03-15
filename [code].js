// api/ref/[code].js
// Vercel Serverless Function — inject OG tag per reseller otomatis

const PROJECT_ID = 'emescbt-29ee1';

export default async function handler(req, res) {
  const { code } = req.query;
  const baseUrl   = 'https://emes.my.id';
  const refUrl    = baseUrl + '/?ref=' + encodeURIComponent(code);

  // Default fallback
  let nama  = 'Emes EduTech';
  let label = 'Tim Emes CBT';

  try {
    // Ambil data reseller dari Firestore REST API (public read)
    const fsUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/resellers?key=AIzaSyAK9kA3GD-Os4eaCl7CFRnf0KMopTqdPKo`;
    const fsRes  = await fetch(fsUrl);
    const fsData = await fsRes.json();

    if (fsData.documents) {
      for (const doc of fsData.documents) {
        const fields = doc.fields || {};
        const docCode = (fields.code?.stringValue || '').toLowerCase();
        if (docCode === code.toLowerCase()) {
          nama  = fields.nama?.stringValue  || nama;
          label = fields.label?.stringValue || label;
          break;
        }
      }
    }
  } catch (e) {
    // Gagal ambil Firestore, pakai default
  }

  const title = 'Emes CBT — ' + nama;
  const desc  = 'Platform CBT On-Premise untuk Sekolah Indonesia. Hubungi ' + nama + ' (' + label + ') untuk informasi lisensi.';
  const image = 'https://emes.my.id/assets/og-image.png';

  const html = [
    '<!DOCTYPE html>',
    '<html lang="id">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>' + title + '</title>',
    '<meta property="og:type" content="website">',
    '<meta property="og:url" content="' + refUrl + '">',
    '<meta property="og:title" content="' + title + '">',
    '<meta property="og:description" content="' + desc + '">',
    '<meta property="og:image" content="' + image + '">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:site_name" content="Emes CBT">',
    '<meta property="og:locale" content="id_ID">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + title + '">',
    '<meta name="twitter:description" content="' + desc + '">',
    '<meta name="twitter:image" content="' + image + '">',
    '<meta name="description" content="' + desc + '">',
    '<link rel="canonical" href="' + refUrl + '">',
    '<meta http-equiv="refresh" content="0;url=' + refUrl + '">',
    '<script>window.location.replace("' + refUrl + '");</script>',
    '</head>',
    '<body><p>Mengalihkan ke halaman Emes CBT...</p></body>',
    '</html>'
  ].join('\n');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.status(200).send(html);
}
