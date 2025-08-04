const Data = require('../model/dataModel');
const RvData = require('../model/rvmodels/rvdatamodel')

const Stars = require('../model/Stars.model')
const Admin = require('../model/RegAdmin')
const Website = require('../model/website')

const bcrypt = require('bcrypt');


function slugify(input) {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}


exports.createAdmin = async(req,res)=>{
  const {email,password}= req.body
  const record=new Admin({
    email:email,
    password:password
  })

  await record.save()
  console.log(record)
  res.send(record)
}



exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and Password are required' });
  }

  try {
      // Find admin by email
      const admin = await Admin.findOne({ email });

      if (!admin) {
          return res.status(404).json({ success: false, message: 'Admin not found' });
      }

      // Compare the provided password with the hashed password
      const isPasswordMatch = await bcrypt.compare(password, admin.password);

      if (!isPasswordMatch) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Successful login
      res.status(200).json({ success: true, message: 'Login successful', admin });
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



exports.search = async(req,res)=>{
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    // Search by title and name (case-insensitive)
    const results = await Data.find({
      $or: [
        { titel: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ]
    }).limit(10); // Limit to 10 results for efficiency

    res.json({ records: results });
  } catch (error) {
    console.error("Error in search API:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}


exports.data = async (req, res) => {
  const { videoNo, views, link, imageUrl, titel, minutes, Category, name, tags, desc, altKeywords, metatitel } = req.body;

  try {
    // Check if `name` is provided and valid
    if (!name || !Array.isArray(name)) {
      return res.status(400).json({ error: "The 'name' field must be an array of strings." });
    }

    // Slugify each name individually
    const slugifiedNames = name.map((item) => slugify(item));
    // Slugify each tag if provided
    const slugifiedTags = (tags && Array.isArray(tags)) ? tags.map((item) => slugify(item)) : tags;

    // Create a new record with the processed `name` array
    const record = new Data({
      imageUrl,
      altKeywords,
      name: slugifiedNames, // Use the slugified array
      tags: slugifiedTags,
      videoNo,
      views,
      link,
      titel,
      metatitel,
      minutes,
      Category,
      desc
    });

    // Save the record to the database
    await record.save();

    console.log(record);
    
    // Auto-generate sitemap after adding new data
    console.log('🔄 Auto-generating sitemap immediately...');
    try {
      const result = await autoGenerateSitemap();
      if (result) {
        console.log('✅ Sitemap auto-generation completed successfully');
      } else {
        console.log('❌ Sitemap auto-generation failed');
      }
    } catch (error) {
      console.error('❌ Error in auto-generating sitemap:', error);
    }
    
    res.status(201).json(record);
  } catch (error) {
    console.error("Error in data post API:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.rvdata = async (req, res) => {
  const { videoNo, views, link, imageUrl, titel, minutes, Category, name, tags, desc, altKeywords, metatitel } = req.body;

  try {
    // Check if `name` is provided and valid
    if (!name || !Array.isArray(name)) {
      return res.status(400).json({ error: "The 'name' field must be an array of strings." });
    }

    // Slugify each name individually
    const slugifiedNames = name.map((item) => slugify(item));
    // Slugify each tag if provided
    const slugifiedTags = (tags && Array.isArray(tags)) ? tags.map((item) => slugify(item)) : tags;

    // Create a new record with the processed `name` array
    const record = new RvData({
      imageUrl,
      altKeywords,
      name: slugifiedNames, // Use the slugified array
      tags: slugifiedTags,
      videoNo,
      views,
      link,
      titel,
      metatitel,
      minutes,
      Category,
      desc
    });

    // Save the record to the database
    await record.save();

    console.log(record);
    
    // Auto-generate sitemap after adding new data
    console.log('🔄 Auto-generating sitemap immediately...');
    try {
      const result = await autoGenerateSitemap();
      if (result) {
        console.log('✅ Sitemap auto-generation completed successfully');
      } else {
        console.log('❌ Sitemap auto-generation failed');
      }
    } catch (error) {
      console.error('❌ Error in auto-generating sitemap:', error);
    }
    
    res.status(201).json(record);
  } catch (error) {
    console.error("Error in data post API:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getpostdata = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16, category = "" } = req.query;

    // console.log('🔍 Search API called with:', { search, page, limit, category });

    let query = {};
    
    // Handle category filter
    if (category && category.trim()) {
      query.Category = { $regex: category, $options: "i" };
    }

    // Handle search functionality
    if (search && search.trim()) {
      const searchTerm = search.trim();
      console.log('🎯 Processing search term:', searchTerm);
      
      // Check if this is a title fallback search (prefixed with 'title:')
      if (searchTerm.startsWith('title:')) {
        const titleSearch = searchTerm.replace('title:', '').trim();
        console.log('📝 Title search detected:', titleSearch);
        
        query.$and = [
          query.Category ? { Category: query.Category } : {},
          {
            $or: [
              { titel: { $regex: titleSearch, $options: "i" } },
              { videoNo: { $regex: titleSearch, $options: "i" } },
              { desc: { $regex: titleSearch, $options: "i" } }
            ]
          }
        ].filter(obj => Object.keys(obj).length > 0);
      } else {
        // Enhanced search: tags, star names, and title
        console.log('🏷️ Enhanced search (tags/stars/title):', searchTerm);
        
        // Create search conditions for tags, star names, and title
        const searchConditions = [
          // Search in tags array (case-insensitive)
          { tags: { $regex: searchTerm, $options: "i" } },
          // Search in star names array (case-insensitive) 
          { name: { $regex: searchTerm, $options: "i" } },
          // Fallback to title and video number
          { titel: { $regex: searchTerm, $options: "i" } },
          { videoNo: { $regex: searchTerm, $options: "i" } },
          // Also search in description
          { desc: { $regex: searchTerm, $options: "i" } }
        ];
        
        if (query.Category) {
          query.$and = [
            { Category: query.Category },
            { $or: searchConditions }
          ];
        } else {
          query.$or = searchConditions;
        }
      }
    }

    console.log('📊 Final MongoDB query:', JSON.stringify(query, null, 2));

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await Data.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records (newest first)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await Data.countDocuments(query);
    
    console.log('✅ Search results:', {
      searchTerm: search,
      totalRecords,
      recordsReturned: records.length,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page)
    });
    
    // Log sample results for debugging
    if (search && records.length > 0) {
      console.log('📋 Sample results:', records.slice(0, 2).map(record => ({
        title: record.titel,
        tags: record.tags,
        stars: record.name,
        category: record.Category
      })));
    }

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("❌ Error in getpostdata API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.rvgetpostdata = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $or: [
        { videoNo: { $regex: search, $options: "i" } },
        { titel: { $regex: search, $options: "i" } },
      ],
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await RvData.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records (newest first)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await RvData.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getpostdata API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.getpopularVideos = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $and: [
        { views: { $gt: 40 } }, // Filter for views greater than 40
        {
          $or: [
            { videoNo: { $regex: search, $options: "i" } },
            { titel: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await Data.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records (newest first)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await Data.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getpostdata API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.rvgetpopularVideos = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $and: [
        { views: { $gt: 40 } }, // Filter for views greater than 40
        {
          $or: [
            { videoNo: { $regex: search, $options: "i" } },
            { titel: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await RvData.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records (newest first)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await RvData.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getpostdata API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getnewVideos = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $and: [
        { views: { $lte: 40 } }, // Filter for views less than or equal to 40
        {
          $or: [
            { videoNo: { $regex: search, $options: "i" } },
            { titel: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await Data.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records (newest first)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await Data.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getLessPopularVideos API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.rvgetnewVideos = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $and: [
        { views: { $lte: 40 } }, // Filter for views less than or equal to 40
        {
          $or: [
            { videoNo: { $regex: search, $options: "i" } },
            { titel: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await RvData.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records (newest first)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await RvData.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getLessPopularVideos API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTopRate = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $and: [
        { views: { $gt: 100 } }, // Filter for views greater than 40
        {
          $or: [
            { videoNo: { $regex: search, $options: "i" } },
            { titel: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await Data.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records (newest first)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await Data.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getpostdata API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.rvgetTopRate = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $and: [
        { views: { $gt: 100 } }, // Filter for views greater than 40
        {
          $or: [
            { videoNo: { $regex: search, $options: "i" } },
            { titel: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await RvData.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records (newest first)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await RvData.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getpostdata API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.relatedpostData = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // Split the search term into words for better matching
    const searchWords = search.split(" ");
    const query = {
      $or: searchWords.map((word) => ({
        titel: { $regex: word, $options: "i" },
      })),
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting, and pagination
    const records = await Data.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await Data.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getpostdata API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.rvrelatedpostData = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // Split the search term into words for better matching
    const searchWords = search.split(" ");
    const query = {
      $or: searchWords.map((word) => ({
        titel: { $regex: word, $options: "i" },
      })),
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting, and pagination
    const records = await RvData.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await RvData.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getpostdata API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMovies = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $or: [
        { videoNo: { $regex: search, $options: "i" } },
        { titel: { $regex: search, $options: "i" } },
      ],
      minutes: { $gte: 49 }, // Filter to show only videos of 49 minutes or more
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting, and pagination
    const records = await Data.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await Data.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getpostdata API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.rvgetMovies = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $or: [
        { videoNo: { $regex: search, $options: "i" } },
        { titel: { $regex: search, $options: "i" } },
      ],
      minutes: { $gte: 49 }, // Filter to show only videos of 49 minutes or more
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting, and pagination
    const records = await RvData.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await RvData.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getpostdata API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.deletepost = async (req, res) => {
  const id = req.params.id;
  try {
    const record = await Data.findByIdAndDelete(id);
    res.json(record);
  } catch (error) {
    console.log("error in delete post api", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.rvdeletepost = async (req, res) => {
  const id = req.params.id;
  try {
    const record = await RvData.findByIdAndDelete(id);
    res.json(record);
  } catch (error) {
    console.log("error in delete post api", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatepost = async (req, res) => {
  const { postId } = req.params;
  const { videoNo, name, tags, views, link, imageUrl, titel, minutes, Category, desc, altKeywords, metatitel } = req.body;

  try {
    // Check if `name` is provided and slugify it if it's an array
    let updatedName = name;
    // Prepare slugified tags for update
    let updatedTags = tags;
    if (tags && Array.isArray(tags)) {
      updatedTags = tags.map((item) => slugify(item));
    }

    if (name && Array.isArray(name)) {
      updatedName = name.map((item) => slugify(item));
    } else if (name && typeof name === 'string') {
      updatedName = slugify(name);
    }

    // Perform the update operation
    const updatedRecord = await Data.findByIdAndUpdate(
      postId,
      {
        imageUrl,
        altKeywords,
        name: updatedName, // Ensure the updated name is slugified
        tags: updatedTags,
        videoNo,
        views,
        link,
        titel,
        minutes,
        Category,
        desc,
        metatitel
      },
      { new: true } // Return the updated document
    );

    if (!updatedRecord) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Auto-generate sitemap after updating data
    console.log('🔄 Auto-generating sitemap after update...');
    try {
      const result = await autoGenerateSitemap();
      if (result) {
        console.log('✅ Sitemap auto-generation completed successfully after update');
      } else {
        console.log('❌ Sitemap auto-generation failed after update');
      }
    } catch (error) {
      console.error('❌ Error in auto-generating sitemap after update:', error);
    }

    res.json(updatedRecord);
  } catch (error) {
    console.error("Error in update post API:", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.rvupdatepost = async (req, res) => {
  const { postId } = req.params;
  const { videoNo, name, tags, views, link, imageUrl, titel, minutes, Category, desc, altKeywords, metatitel } = req.body;

  try {
    // Check if `name` is provided and slugify it if it's an array
    let updatedName = name;
    // Prepare slugified tags for update
    let updatedTags = tags;
    if (tags && Array.isArray(tags)) {
      updatedTags = tags.map((item) => slugify(item));
    }

    if (name && Array.isArray(name)) {
      updatedName = name.map((item) => slugify(item));
    } else if (name && typeof name === 'string') {
      updatedName = slugify(name);
    }

    // Perform the update operation
    const updatedRecord = await RvData.findByIdAndUpdate(
      postId,
      {
        imageUrl,
        altKeywords,
        name: updatedName, // Ensure the updated name is slugified
        tags: updatedTags,
        videoNo,
        views,
        link,
        titel,
        minutes,
        Category,
        desc,
        metatitel
      },
      { new: true } // Return the updated document
    );

    if (!updatedRecord) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Auto-generate sitemap after updating data
    console.log('🔄 Auto-generating sitemap after rvupdate...');
    try {
      const result = await autoGenerateSitemap();
      if (result) {
        console.log('✅ Sitemap auto-generation completed successfully after rvupdate');
      } else {
        console.log('❌ Sitemap auto-generation failed after rvupdate');
      }
    } catch (error) {
      console.error('❌ Error in auto-generating sitemap after rvupdate:', error);
    }

    res.json(updatedRecord);
  } catch (error) {
    console.error("Error in update post API:", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};




  exports.addStar = async(req,res)=>{
    const {starUrl,starName,starLike,starImgUrl} = req.body
  const StarCheack= await Stars.findOne({starName:starName})
   console.log(StarCheack) 
   if(StarCheack==null){
    const record= await new Stars({
      starurl:starUrl,
      starName:starName,
      likes:starLike,
      starImgUrl:starImgUrl
     })
     await record.save()
    //  console.log(record)
     res.json(record)

    }
    else{
      res.json({
        message:"Star Is allready Added"
      })
    }
  }


  exports.getstars = async(req,res)=>{
   const record= await Stars.find()
   res.json(record)
  }


  // Update a star by ID
exports.updateStar = async (req, res) => {
  const starId = req.params.starId;
  const { starUrl, starName, starLike, starImgUrl } = req.body;

  try {
    const updatedStar = await Stars.findByIdAndUpdate(
      starId,
      { starurl: starUrl, starName, likes: starLike, starImgUrl },
      { new: true } // This option returns the modified document rather than the original.
    );

    if (!updatedStar) {
      return res.status(404).json({ error: 'Star not found' });
    }

    res.json(updatedStar);
  } catch (error) {
    console.log("Error in update star API", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a star by ID
exports.deleteStar = async (req, res) => {
  const starId = req.params.starId;

  try {
    const deletedStar = await Stars.findByIdAndDelete(starId);

    if (!deletedStar) {
      return res.status(404).json({ error: 'Star not found' });
    }

    res.json(deletedStar);
  } catch (error) {
    console.log("Error in delete star API", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateviews = async (req, res) => {
  const { id } = req.params;
  const { views } = req.body;

  try {
    const updatedPost = await Data.findByIdAndUpdate(id, { views }, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(updatedPost);
  } catch (error) {
    console.log("Error in update views API", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.rvupdateviews = async (req, res) => {
  const { id } = req.params;
  const { views } = req.body;

  try {
    const updatedPost = await RvData.findByIdAndUpdate(id, { views }, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(updatedPost);
  } catch (error) {
    console.log("Error in update views API", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getindians = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $and: [
        { Category: "indian" }, // Filter for "indian" category
        {
          $or: [
            { videoNo: { $regex: search, $options: "i" } }, // Search by video number
            { titel: { $regex: search, $options: "i" } },   // Search by title
          ],
        },
      ],
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await Data.find(query)
      .sort({ createdAt: -1 }) // Sort by newest records first
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await Data.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getindians API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.rvgetindians = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $and: [
        { Category: "indian" }, // Filter for "indian" category
        {
          $or: [
            { videoNo: { $regex: search, $options: "i" } }, // Search by video number
            { titel: { $regex: search, $options: "i" } },   // Search by title
          ],
        },
      ],
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await RvData.find(query)
      .sort({ createdAt: -1 }) // Sort by newest records first
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await RvData.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getindians API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getHijabi = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $and: [
        { Category: "hijabi" }, // Filter for hijabi category
        {
          $or: [
            { videoNo: { $regex: search, $options: "i" } }, // Search in videoNo
            { titel: { $regex: search, $options: "i" } },   // Search in titel
          ],
        },
      ],
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await Data.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records (newest first)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await Data.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getHijabi API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.rvgetHijabi = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 16 } = req.query;

    // MongoDB query to filter data
    const query = {
      $and: [
        { Category: "hijabi" }, // Filter for hijabi category
        {
          $or: [
            { videoNo: { $regex: search, $options: "i" } }, // Search in videoNo
            { titel: { $regex: search, $options: "i" } },   // Search in titel
          ],
        },
      ],
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records with search, sorting by createdAt (most recent first), and pagination
    const records = await RvData.find(query)
      .sort({ createdAt: -1 }) // Sort by latest records (newest first)
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total count for pagination metadata
    const totalRecords = await RvData.countDocuments(query);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.log("Error in getHijabi API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.getVideo = async(req,res)=>{
 const id =req.params.id
 const record=  await Data.findById(id)
 res.json(record)
}

exports.rvgetVideo = async(req,res)=>{
  const id =req.params.id
  const record=  await RvData.findById(id)
  res.json(record)
 }
 



exports.searchByName = async (req, res) => {
  try {
    const { name } = req.params;
    const { page = 1, limit = 16 } = req.query; // Get page and limit from query parameters

    // MongoDB query to match the name using $regex for case-insensitive and partial match
    const query = {
      name: { $regex: name, $options: 'i' }, // Case-insensitive match of the name
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records matching the query with pagination
    const records = await Data.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Sorting by createdAt, most recent first

    // Get the total count of documents matching the query (for pagination metadata)
    const totalRecords = await Data.countDocuments(query);

    // Return the paginated data along with metadata
    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

exports.rvsearchByName = async (req, res) => {
  try {
    const { name } = req.params;
    const { page = 1, limit = 16 } = req.query; // Get page and limit from query parameters

    // MongoDB query to match the name using $regex for case-insensitive and partial match
    const query = {
      name: { $regex: name, $options: 'i' }, // Case-insensitive match of the name
    };

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch records matching the query with pagination
    const records = await RvData.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Sorting by createdAt, most recent first

    // Get the total count of documents matching the query (for pagination metadata)
    const totalRecords = await RvData.countDocuments(query);

    // Return the paginated data along with metadata
    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      records,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};


exports.addWebsite = async (req, res) => {
  try {
    const { name, link, description,email } = req.body;
    const logoFile = req.file;

    if (!logoFile) {
      return res.status(400).send("Logo is required.");
    }

    const record = new Website({
      webName: name,
      webLink: link,
      webDesc: description,
      email:email,
      webLogo: logoFile.filename,
      active: false
    });
      console.log(record)
    await record.save();
    res.status(201).send(record);
  } catch (err) {
    console.error("Error saving website:", err);
    res.status(500).send("Server error.");
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) return res.status(404).send({ message: "Website not found" });

    website.active = !website.active;
    await website.save();
    res.send({ message: "Status updated", active: website.active });
  } catch (err) {
    res.status(500).send({ message: "Error updating status" });
  }
};

exports.findWebsite = async(req,res)=>{
  const record=await Website.find()
  res.send(record)
}

exports.deleteWebsite = async(req,res)=>{
  const id=req.params.id
  const record=await Website.findByIdAndDelete(id)
  res.send({
    message:"deleted",
    data:record
  })
}

exports.generateSitemap = async (req, res) => {
  try {
    console.log('🚀 Starting automatic sitemap generation...');
    
    // Fetch all posts
    const allRecords = await Data.find({}).sort({ createdAt: -1 });
    console.log(`📊 Total records found: ${allRecords.length}`);

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
      } else if (typeof post.name === 'string' && post.name.trim()) {
        pornstarSet.add(post.name);
      }
    });
    const pornstars = Array.from(pornstarSet);
    console.log(`⭐ Unique pornstars found: ${pornstars.length}`);

    // Static pages
    const staticUrls = [
      '',
      'indian',
      'muslim',
      'top-videos',
      'new-content',
      'most-liked',
      'pornstars',
      'our-network',
      'category/scout69',
      'category/comxxx',
      'category/badwap',
      'category/chochox',
      'category/sex18',
      'category/aunt-sex',
      'category/fullporner',
      'category/lesbify',
      'category/milfnut',
      'category/sex-sister',
      'category/desi49',
      'category/dehati-sex',
      'category/boobs-pressing',
      'category/blueflim',
      'category/famili-sex-com',
      'category/teen-sex',
      'category/small-tits',
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

    // Video URLs (limit to first 5000 for performance)
    const videoUrls = allRecords.slice(0, 5000).map(post => {
      const slugifiedTitle = post.titel ? slugify(post.titel) : "";
      return `<url><loc>https://vipmilfnut.com/video/${post._id}${slugifiedTitle ? `-${slugifiedTitle}` : ''}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></url>`;
    }).join('\n');

    const totalUrls = urls.length + allRecords.slice(0, 5000).length;
    console.log(`📈 Total URLs in sitemap: ${totalUrls}`);

    // Generate final XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n${videoUrls}\n</urlset>`;

    // Save sitemap to public folder
    const fs = require('fs');
    const path = require('path');
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log(`✅ Sitemap saved to: ${sitemapPath}`);
    
    // Also copy to frontend public folder
    const frontendSitemapPath = path.join(__dirname, '../../vipmilfnut/public/sitemap.xml');
    try {
      fs.writeFileSync(frontendSitemapPath, sitemap, 'utf8');
      console.log(`✅ Sitemap also copied to frontend: ${frontendSitemapPath}`);
    } catch (error) {
      console.log('⚠️ Could not copy to frontend (development only):', error.message);
    }

    res.json({
      success: true,
      message: 'Sitemap generated successfully',
      stats: {
        totalRecords: allRecords.length,
        uniqueTags: tags.length,
        uniquePornstars: pornstars.length,
        totalUrls: totalUrls,
        sitemapPath: sitemapPath
      }
    });

  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
    res.status(500).json({ error: "Failed to generate sitemap" });
  }
};

// Auto-generate sitemap after adding new data (using new structure)
const autoGenerateSitemap = async () => {
  try {
    console.log('🔄 Auto-generating all sitemaps after data update...');
    console.log('📅 Timestamp:', new Date().toISOString());
    
    // Create a mock request and response object for the sitemap functions
    const mockReq = {};
    const mockRes = {
      json: (data) => {
        if (data.success) {
          console.log(`✅ ${data.message}`);
        } else {
          console.log(`❌ Sitemap generation failed:`, data);
        }
      }
    };
    
    // Generate all sitemaps (excluding videos as per user request)
    console.log('📄 Generating static sitemap...');
    await exports.generateStaticSitemap(mockReq, mockRes);
    
    console.log('🏷️ Generating tags sitemap...');
    await exports.generateTagsSitemap(mockReq, mockRes);
    
    console.log('⭐ Generating pornstars sitemap...');
    await exports.generatePornstarsSitemap(mockReq, mockRes);
    
    // await exports.generateVideosSitemap(mockReq, mockRes); // Removed as per user request
    
    console.log('📋 Generating sitemap index...');
    await exports.generateSitemapIndex(mockReq, mockRes);
    
    console.log('✅ All sitemaps auto-generated successfully');
    return true;

  } catch (error) {
    console.error("❌ Error in auto-generating sitemaps:", error);
    console.error("❌ Error stack:", error.stack);
    return false;
  }
};

// Generate main sitemap index (like JennyMovies)
exports.generateSitemapIndex = async (req, res) => {
  try {
    console.log('🚀 Generating sitemap index...');
    
    const today = new Date().toISOString().split('T')[0];
    const baseUrl = 'https://vipmilfnut.com';
    
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-tags.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-pornstars.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

    const fs = require('fs');
    const path = require('path');
    
    // Save main sitemap index
    const sitemapIndexPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapIndexPath, sitemapIndex, 'utf8');
    
    // Copy to frontend
    const frontendSitemapPath = path.join(__dirname, '../../vipmilfnut/public/sitemap.xml');
    fs.writeFileSync(frontendSitemapPath, sitemapIndex, 'utf8');
    
    console.log('✅ Sitemap index generated successfully');
    
    res.json({
      success: true,
      message: 'Sitemap index generated successfully',
      sitemaps: [
        'sitemap-static.xml',
        'sitemap-tags.xml', 
        'sitemap-pornstars.xml'
      ]
    });

  } catch (error) {
    console.error("❌ Error generating sitemap index:", error);
    res.status(500).json({ error: "Failed to generate sitemap index" });
  }
};

// Generate static pages sitemap
exports.generateStaticSitemap = async (req, res) => {
  try {
    console.log('🚀 Generating static sitemap...');
    
    const today = new Date().toISOString().split('T')[0];
    const baseUrl = 'https://vipmilfnut.com';
    
    const staticPages = [
      '', 'indian', 'muslim', 'top-videos', 'new-content', 'most-liked', 'pornstars', 'our-network',
      'category/scout69', 'category/comxxx', 'category/badwap', 'category/chochox', 'category/sex18',
      'category/aunt-sex', 'category/fullporner', 'category/lesbify', 'category/milfnut',
      'category/sex-sister', 'category/desi49', 'category/dehati-sex', 'category/boobs-pressing',
      'category/blueflim', 'category/famili-sex-com', 'category/teen-sex', 'category/small-tits',
    ];

    const staticUrls = staticPages.map(page => 
      `  <url>
    <loc>${baseUrl}/${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    ).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
</urlset>`;

    const fs = require('fs');
    const path = require('path');
    
    // Save static sitemap
    const staticSitemapPath = path.join(__dirname, '../public/sitemap-static.xml');
    fs.writeFileSync(staticSitemapPath, sitemap, 'utf8');
    
    // Copy to frontend
    const frontendStaticPath = path.join(__dirname, '../../vipmilfnut/public/sitemap-static.xml');
    fs.writeFileSync(frontendStaticPath, sitemap, 'utf8');
    
    console.log(`✅ Static sitemap generated with ${staticPages.length} pages`);
    
    res.json({
      success: true,
      message: 'Static sitemap generated successfully',
      pages: staticPages.length
    });

  } catch (error) {
    console.error("❌ Error generating static sitemap:", error);
    res.status(500).json({ error: "Failed to generate static sitemap" });
  }
};

// Generate tags sitemap (dynamic)
exports.generateTagsSitemap = async (req, res) => {
  try {
    console.log('🚀 Generating tags sitemap...');
    
    // Get records from both Data and RvData models
    const allDataRecords = await Data.find({}).sort({ createdAt: -1 });
    const allRvDataRecords = await RvData.find({}).sort({ createdAt: -1 });
    const tagSet = new Set();
    
    // Process Data records
    allDataRecords.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (tag && tag.trim()) tagSet.add(tag);
        });
      }
    });
    
    // Process RvData records
    allRvDataRecords.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (tag && tag.trim()) tagSet.add(tag);
        });
      }
    });

    const tags = Array.from(tagSet);
    const today = new Date().toISOString().split('T')[0];
    const baseUrl = 'https://vipmilfnut.com';

    const tagUrls = tags.map(tag => 
      `  <url>
    <loc>${baseUrl}/tag/${escapeXml(tag)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`
    ).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${tagUrls}
</urlset>`;

    const fs = require('fs');
    const path = require('path');
    
    // Save tags sitemap
    const tagsSitemapPath = path.join(__dirname, '../public/sitemap-tags.xml');
    fs.writeFileSync(tagsSitemapPath, sitemap, 'utf8');
    
    // Copy to frontend
    const frontendTagsPath = path.join(__dirname, '../../vipmilfnut/public/sitemap-tags.xml');
    fs.writeFileSync(frontendTagsPath, sitemap, 'utf8');
    
    console.log(`✅ Tags sitemap generated with ${tags.length} tags`);
    
    res.json({
      success: true,
      message: 'Tags sitemap generated successfully',
      tags: tags.length
    });

  } catch (error) {
    console.error("❌ Error generating tags sitemap:", error);
    res.status(500).json({ error: "Failed to generate tags sitemap" });
  }
};

// Generate pornstars sitemap (dynamic)
exports.generatePornstarsSitemap = async (req, res) => {
  try {
    console.log('🚀 Generating pornstars sitemap...');
    
    // Get records from both Data and RvData models
    const allDataRecords = await Data.find({}).sort({ createdAt: -1 });
    const allRvDataRecords = await RvData.find({}).sort({ createdAt: -1 });
    const pornstarSet = new Set();
    
    // Process Data records
    allDataRecords.forEach(post => {
      if (Array.isArray(post.name)) {
        post.name.forEach(star => {
          if (star && star.trim()) pornstarSet.add(star);
        });
      }
    });
    
    // Process RvData records
    allRvDataRecords.forEach(post => {
      if (Array.isArray(post.name)) {
        post.name.forEach(star => {
          if (star && star.trim()) pornstarSet.add(star);
        });
      }
    });

    const pornstars = Array.from(pornstarSet);
    const today = new Date().toISOString().split('T')[0];
    const baseUrl = 'https://vipmilfnut.com';

    const pornstarUrls = pornstars.map(star => 
      `  <url>
    <loc>${baseUrl}/pornstar/${escapeXml(star)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`
    ).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pornstarUrls}
</urlset>`;

    const fs = require('fs');
    const path = require('path');
    
    // Save pornstars sitemap
    const pornstarsSitemapPath = path.join(__dirname, '../public/sitemap-pornstars.xml');
    fs.writeFileSync(pornstarsSitemapPath, sitemap, 'utf8');
    
    // Copy to frontend
    const frontendPornstarsPath = path.join(__dirname, '../../vipmilfnut/public/sitemap-pornstars.xml');
    fs.writeFileSync(frontendPornstarsPath, sitemap, 'utf8');
    
    console.log(`✅ Pornstars sitemap generated with ${pornstars.length} pornstars`);
    
    res.json({
      success: true,
      message: 'Pornstars sitemap generated successfully',
      pornstars: pornstars.length
    });

  } catch (error) {
    console.error("❌ Error generating pornstars sitemap:", error);
    res.status(500).json({ error: "Failed to generate pornstars sitemap" });
  }
};

// Generate videos sitemap
exports.generateVideosSitemap = async (req, res) => {
  try {
    console.log('🚀 Generating videos sitemap...');
    
    // Get records from both Data and RvData models
    const allDataRecords = await Data.find({}).sort({ createdAt: -1 }).limit(2500);
    const allRvDataRecords = await RvData.find({}).sort({ createdAt: -1 }).limit(2500);
    const allRecords = [...allDataRecords, ...allRvDataRecords];
    const today = new Date().toISOString().split('T')[0];
    const baseUrl = 'https://vipmilfnut.com';

    const videoUrls = allRecords.map(post => {
      const slugifiedTitle = post.titel ? slugify(post.titel) : "";
      return `  <url>
    <loc>${baseUrl}/video/${post._id}${slugifiedTitle ? `-${escapeXml(slugifiedTitle)}` : ''}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${videoUrls}
</urlset>`;

    const fs = require('fs');
    const path = require('path');
    
    // Save videos sitemap
    const videosSitemapPath = path.join(__dirname, '../public/sitemap-videos.xml');
    fs.writeFileSync(videosSitemapPath, sitemap, 'utf8');
    
    // Copy to frontend
    const frontendVideosPath = path.join(__dirname, '../../vipmilfnut/public/sitemap-videos.xml');
    fs.writeFileSync(frontendVideosPath, sitemap, 'utf8');
    
    console.log(`✅ Videos sitemap generated with ${allRecords.length} videos`);
    
    res.json({
      success: true,
      message: 'Videos sitemap generated successfully',
      videos: allRecords.length
    });

  } catch (error) {
    console.error("❌ Error generating videos sitemap:", error);
    res.status(500).json({ error: "Failed to generate videos sitemap" });
  }
};

// Generate all sitemaps at once
exports.generateAllSitemaps = async (req, res) => {
  try {
    console.log('🚀 Generating all sitemaps...');
    
    // Generate all individual sitemaps
    await exports.generateStaticSitemap(req, res);
    await exports.generateTagsSitemap(req, res);
    await exports.generatePornstarsSitemap(req, res);
    await exports.generateVideosSitemap(req, res);
    
    // Generate main sitemap index
    await exports.generateSitemapIndex(req, res);
    
    console.log('✅ All sitemaps generated successfully');
    
    res.json({
      success: true,
      message: 'All sitemaps generated successfully',
      sitemaps: [
        'sitemap.xml (index)',
        'sitemap-static.xml',
        'sitemap-tags.xml',
        'sitemap-pornstars.xml',
        'sitemap-videos.xml'
      ]
    });

  } catch (error) {
    console.error("❌ Error generating all sitemaps:", error);
    res.status(500).json({ error: "Failed to generate all sitemaps" });
  }
};