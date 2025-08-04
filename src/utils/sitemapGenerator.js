// Dynamic Sitemap Generator for VipMilfNut
const apiUrl = process.env.REACT_APP_API_URL;

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Function to sync sitemap from backend to frontend
export const syncSitemapFromBackend = async () => {
  try {
    console.log('🔄 Syncing sitemap from backend...');
    
    // Call backend sitemap generation
    const response = await fetch(`${apiUrl}/generate-sitemap`, { mode: "cors" });
    if (!response.ok) throw new Error("Failed to generate sitemap from backend");
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Backend sitemap generated successfully');
      
      // Now copy the backend sitemap to frontend public folder
      const fs = require('fs');
      const path = require('path');
      
      const backendSitemapPath = path.join(__dirname, '../../../api/public/sitemap.xml');
      const frontendSitemapPath = path.join(__dirname, '../../public/sitemap.xml');
      
      if (fs.existsSync(backendSitemapPath)) {
        const sitemapContent = fs.readFileSync(backendSitemapPath, 'utf8');
        fs.writeFileSync(frontendSitemapPath, sitemapContent, 'utf8');
        console.log(`✅ Sitemap synced to frontend: ${frontendSitemapPath}`);
        return true;
      } else {
        console.error('❌ Backend sitemap file not found');
        return false;
      }
    } else {
      console.error('❌ Backend sitemap generation failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error syncing sitemap:', error);
    return false;
  }
};

export const generateSitemap = async () => {
  try {
    console.log('🚀 Starting sitemap generation...');
    
    // Fetch all posts to get video URLs, tags, and pornstars
    const response = await fetch(`${apiUrl}/getpostdata?page=1&limit=10000`, { mode: "cors" });
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    const allRecords = data.records || [];
    
    console.log(`📊 Total records fetched: ${allRecords.length}`);

    // Extract unique tags
    const tagSet = new Set();
    allRecords.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (tag && tag.trim()) {
            tagSet.add(tag); // Already slugified in database
          }
        });
      }
    });
    const tags = Array.from(tagSet);
    console.log(`🏷️ Unique tags found: ${tags.length}`);

    // Extract unique pornstar names
    const pornstarSet = new Set();
    allRecords.forEach(post => {
      if (Array.isArray(post.name)) {
        post.name.forEach(star => {
          if (star && star.trim()) {
            pornstarSet.add(star); // Already slugified in database
          }
        });
      }
    });
    const pornstars = Array.from(pornstarSet);
    console.log(`⭐ Unique pornstars found: ${pornstars.length}`);

    // Static pages
    const staticUrls = [
      '', 'indian', 'muslim', 'top-videos', 'new-content', 'most-liked', 'pornstars', 'our-network',
      'category/scout69', 'category/comxxx', 'category/badwap', 'category/chochox', 'category/sex18',
      'category/aunt-sex', 'category/fullporner', 'category/lesbify', 'category/milfnut',
      'category/sex-sister', 'category/desi49', 'category/dehati-sex', 'category/boobs-pressing',
      'category/blueflim', 'category/famili-sex-com', 'category/teen-sex', 'category/small-tits',
    ];

    let urls = [];

    // Static pages
    staticUrls.forEach(path => {
      urls.push(`<url><loc>https://vipmilfnut.com/${path}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></url>`);
    });

    // Tag pages
    tags.forEach(tag => {
      urls.push(`<url><loc>https://vipmilfnut.com/tag/${escapeXml(tag)}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></url>`);
    });

    // Pornstar pages
    pornstars.forEach(star => {
      urls.push(`<url><loc>https://vipmilfnut.com/pornstar/${escapeXml(star)}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></url>`);
    });

    // Video URLs (limit to 5000 for performance)
    const videoUrls = allRecords.slice(0, 5000).map(post => {
      const slugifiedTitle = post.titel ? slugify(post.titel) : "";
      return `<url><loc>https://vipmilfnut.com/video/${post._id}${slugifiedTitle ? `-${escapeXml(slugifiedTitle)}` : ''}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></url>`;
    }).join('\n');

    // Generate sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n${videoUrls}\n</urlset>`;
    
    // Save sitemap to frontend public folder
    const fs = require('fs');
    const path = require('path');
    const sitemapPath = path.join(__dirname, '../../public/sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log(`✅ Sitemap saved to: ${sitemapPath}`);
    console.log(`📊 Total URLs: ${urls.length + allRecords.slice(0, 5000).length}`);

    return {
      success: true,
      stats: {
        totalRecords: allRecords.length,
        uniqueTags: tags.length,
        uniquePornstars: pornstars.length,
        totalUrls: urls.length + allRecords.slice(0, 5000).length,
        sitemapPath: sitemapPath
      }
    };

  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const downloadSitemap = async () => {
  console.log('📥 Starting sitemap download...');
  const sitemap = await generateSitemap();
  if (sitemap) {
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    console.log('✅ Sitemap downloaded successfully!');
  } else {
    console.error('❌ Failed to generate sitemap for download');
  }
}; 