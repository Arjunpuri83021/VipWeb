const express = require('express');
const router = express.Router();
const multer = require('multer');
const cAPi = require('../controler/controlers');
const ControlerApi = require("../controler/toyController");


// Sitemap Route
// Sitemap Route
router.get('/sitemap.xml', (req, res) => {
  const urls = [
    { loc: 'https://hexmy.com/', lastmod: '2024-11-13', changefreq: 'daily', priority: 1.0 },
    { loc: 'https://hexmy.com/stars', lastmod: '2024-11-13', changefreq: 'monthly', priority: 0.8 },
    { loc: 'https://hexmy.com/indian', lastmod: '2024-11-13', changefreq: 'monthly', priority: 0.8 },
    { loc: 'https://hexmy.com/hijabi', lastmod: '2024-11-13', changefreq: 'monthly', priority: 0.8 },
    { loc: 'https://hexmy.com/newVideos', lastmod: '2024-11-13', changefreq: 'monthly', priority: 0.8 },
    { loc: 'https://hexmy.com/popularVideos', lastmod: '2024-11-13', changefreq: 'monthly', priority: 0.8 },
    { loc: 'https://hexmy.com/toprated', lastmod: '2024-11-13', changefreq: 'monthly', priority: 0.8 },
    // Add more pages here if needed
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  urls.forEach(url => {
    xml += `
    <url>
      <loc>${url.loc}</loc>
      <lastmod>${url.lastmod}</lastmod>
      <changefreq>${url.changefreq}</changefreq>
      <priority>${url.priority}</priority>
    </url>`;
  });

  xml += '\n</urlset>';

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.send(xml);
});


// Multer Configuration
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads"); // File destination
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  },
});

let upload = multer({
  storage: storage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6 MB file limit
});

// Example Route
router.get('/', (req, res) => {
  res.send("Welcome to Hexmy API!");
});


router.post("/product", upload.single("image"), ControlerApi.Product); // clothe prodect add api
router.get('/getAllClothe',ControlerApi.getClothe) // clothe data find api
router.delete('/deleteproduct/:id', ControlerApi.deleteProduct) // this for delete clothe prodect
router.get('/showeditvalues/:id', ControlerApi.showeditvalues) // this is for show values in edit modal
router.put("/updateproduct/:id",upload.single("image"), ControlerApi.updateProduct) // update clothe product
router.get("/getAllProduct",ControlerApi.getAllProduct) // this is for all product get
router.get("/getAllElectronic",ControlerApi.getAllElectronic)
router.get("/getAllGrocery",ControlerApi.getAllGrocery)
router.post('/idsprodects',ControlerApi.idsprodects)
router.post('/checkout',ControlerApi.checkout)
router.get('/findCheckout',ControlerApi.findCheckout)  // this is for all checkout order address and data
router.post('/findorders',ControlerApi.findorders) 
router.delete('/deleteorder/:id',ControlerApi.deleteOrder)  /// this is for delete order
router.get('/productfindbyId/:id',ControlerApi.productbyid) // this is for find product for cheackout data from ProductModel
router.post('/userregister',upload.single("profile"),ControlerApi.userregister) // this is for register user
router.post('/userlogin',ControlerApi.userlogin) // this is for login user
router.get('/findusers',ControlerApi.findusers) // this is for findall users
router.get('/findUserOrder/:userId',ControlerApi.findUserOrder)


router.post('/adminReg',cAPi.createAdmin)
router.post('/adminlogin',cAPi.loginAdmin)

// API Routes
router.post("/postdata", cAPi.data);
router.post("/rvpostdata", cAPi.rvdata);

router.get('/getpostdata', cAPi.getpostdata);
router.get('/rvgetpostdata', cAPi.rvgetpostdata);

router.get('/relatedpostData',cAPi.relatedpostData)
router.get('/rvrelatedpostData',cAPi.rvrelatedpostData)

router.get('/getmovies',cAPi.getMovies)
router.get('/rvgetmovies',cAPi.rvgetMovies)

router.get('/getpopularVideos', cAPi.getpopularVideos);
router.get('/rvgetpopularVideos', cAPi.rvgetpopularVideos);


router.get('/getnewVideos', cAPi.getnewVideos);
router.get('/rvgetnewVideos', cAPi.rvgetnewVideos);


router.get('/getTopRate', cAPi.getTopRate);
router.get('/rvgetTopRate', cAPi.rvgetTopRate);





router.delete('/deletepost/:id', cAPi.deletepost);
router.delete('/rvdeletepost/:id', cAPi.rvdeletepost);


router.put('/updatepost/:postId', cAPi.updatepost);
router.put('/rvupdatepost/:postId', cAPi.rvupdatepost);

// Star-related API Endpoints
router.post('/addStar', cAPi.addStar);
router.get('/getstars', cAPi.getstars);
router.put('/updateStar/:starId', cAPi.updateStar);
router.delete('/deleteStar/:starId', cAPi.deleteStar);

// Views and Categories
router.post('/updateviews/:id', cAPi.updateviews);
router.post('/rvupdateviews/:id', cAPi.rvupdateviews);

router.get('/getindians', cAPi.getindians);
router.get('/rvgetindians', cAPi.rvgetindians);


router.get('/getHijabi', cAPi.getHijabi);
router.get('/rvgetHijabi', cAPi.rvgetHijabi);


//video Get
router.post('/getVideo/:id', cAPi.getVideo);
router.post('/rvgetVideo/:id', cAPi.rvgetVideo);

router.get("/pornstar/:name", cAPi.searchByName)
router.get("/rvpornstar/:name", cAPi.rvsearchByName)

router.post('/add-website', upload.single('logo'),cAPi.addWebsite);
router.get('/find-website',cAPi.findWebsite)
router.delete('/delete-website/:id',cAPi.deleteWebsite)
router.patch('/toggle-active/:id',cAPi.toggleActive)



router.get('/search',cAPi.search)

// Sitemap generation endpoints (like JennyMovies structure)
router.get('/generate-sitemap', cAPi.generateSitemap);
router.get('/generate-all-sitemaps', cAPi.generateAllSitemaps);
router.get('/generate-sitemap-index', cAPi.generateSitemapIndex);
router.get('/generate-static-sitemap', cAPi.generateStaticSitemap);
router.get('/generate-tags-sitemap', cAPi.generateTagsSitemap);
router.get('/generate-pornstars-sitemap', cAPi.generatePornstarsSitemap);
router.get('/generate-videos-sitemap', cAPi.generateVideosSitemap);

// ============= PERFORMANCE OPTIMIZED ROUTES =============
// New optimized endpoints for better performance
router.get('/tags', cAPi.getAllTags);                    // Get all unique tags
router.get('/tags/random', cAPi.getRandomTags);          // Get random tags for Home page
router.get('/tags/:tagName/posts', cAPi.getPostsByTag);  // Get posts by tag with pagination
router.post('/tags/images', cAPi.getTagImages);          // Get images for multiple tags
router.get('/tags/:tagName/metadata', cAPi.getTagMetadata); // Get tag metadata (unique tags & pornstars)

// Optimized pornstar endpoints
router.get('/pornstars', cAPi.getAllPornstars);          // Get all unique pornstars with pagination
router.post('/pornstars/images', cAPi.getPornstarImages); // Get images for multiple pornstars

// Optimized footer endpoints
router.get('/footer/tags', cAPi.getFooterTags);          // Get random tags for footer
router.get('/footer/pornstars', cAPi.getFooterPornstars); // Get random pornstars for footer

module.exports = router;
