// Meta tag generator for server-side rendering
const fs = require('fs');
const path = require('path');

// Common tags for different page types
const generateMetaTags = (pageType, tag = '', page = 1) => {
  const baseUrl = 'https://vipmilfnut.com';
  
  switch (pageType) {
    case 'tag':
      const capitalizedTag = tag.replace(/-/g, ' ').charAt(0).toUpperCase() + tag.replace(/-/g, ' ').slice(1);
      const canonicalUrl = page === 1 ? `${baseUrl}/tag/${tag}` : `${baseUrl}/tag/${tag}/${page}`;
      const description = `${capitalizedTag} porn videos collection for 18+ adults. ✔ Free Full Access ✔ Tons Of Movies ✔ 100% Hot sex18 Content ☛ Enjoy NOW!`;
      const keywords = `${capitalizedTag}, ${capitalizedTag} porn, ${capitalizedTag} videos, adult content, free porn, sex videos, xxx movies`;
      const title = `Tranding ${capitalizedTag} Sex Videos Free on VipMilfNut.com`;
      
      return {
        title,
        description,
        keywords,
        canonical: canonicalUrl,
        ogTitle: `⬤ Full ${capitalizedTag} Porn Videos & xxbrits Porn videos ⬤ VipMilfNut`,
        ogDescription: description,
        ogUrl: canonicalUrl
      };
      
    default:
      return {
        title: 'VipMilfNut - Free HD Porn Videos',
        description: 'Watch free HD porn videos on VipMilfNut. Best adult content with thousands of videos.',
        keywords: 'free porn, adult videos, xxx movies, porn videos',
        canonical: baseUrl,
        ogTitle: 'VipMilfNut - Free HD Porn Videos',
        ogDescription: 'Watch free HD porn videos on VipMilfNut. Best adult content with thousands of videos.',
        ogUrl: baseUrl
      };
  }
};

// Generate HTML template with meta tags
const generateHtmlWithMeta = (metaTags) => {
  return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="robots" content="index, follow">
    
    <!-- Dynamic Meta Tags -->
    <title>${metaTags.title}</title>
    <meta name="description" content="${metaTags.description}" />
    <meta name="keywords" content="${metaTags.keywords}" />
    <link rel="canonical" href="${metaTags.canonical}" />
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="${metaTags.ogTitle}" />
    <meta property="og:description" content="${metaTags.ogDescription}" />
    <meta property="og:url" content="${metaTags.ogUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="VipMilfNut" />
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${metaTags.ogTitle}" />
    <meta name="twitter:description" content="${metaTags.ogDescription}" />
    
    <!-- Static Meta Tags -->
    <meta name="author" content="VipMilfNut" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="language" content="English" />
    <meta name="revisit-after" content="1 days" />
    <meta name="distribution" content="global" />
    <meta name="rating" content="adult" />
    <meta name="classification" content="adult content" />
    
    <!-- Favicons -->
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" type="image/x-icon" />
    <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico" type="image/x-icon" />
    <link rel="icon" type="image/png" sizes="32x32" href="%PUBLIC_URL%/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="%PUBLIC_URL%/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="%PUBLIC_URL%/apple-touch-icon.png" />
    <link rel="manifest" href="%PUBLIC_URL%/site.webmanifest" />
    
    <!-- Google Verification -->
    <meta name="google-site-verification" content="aGfyXFqm1ny07jojrD2d9oSTr_u3D_4MZCTFPqBkr9o" />
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-RCK9STX7KT"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-RCK9STX7KT');
    </script>
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

    <!-- Service Worker -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {})
                    .catch((registrationError) => {});
            });
        }
    </script>
</body>
</html>`;
};

module.exports = { generateMetaTags, generateHtmlWithMeta };
