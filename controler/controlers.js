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
    console.log('🚀 Starting generation of all sitemaps...');
    
    // Generate all sitemaps
    await generateSitemapIndex();
    await generateStaticSitemap();
    await generateTagsSitemap();
    await generatePornstarsSitemap();
    await generateVideosSitemap();
    
    console.log('✅ All sitemaps generated successfully!');
    
    res.json({
      success: true,
      message: 'All sitemaps generated successfully',
      sitemaps: [
        'sitemap-index.xml',
        'sitemap-static.xml', 
        'sitemap-tags.xml',
        'sitemap-pornstars.xml',
        'sitemap-videos.xml'
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error generating all sitemaps:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating sitemaps',
      error: error.message
    });
  }
};

// ============= PERFORMANCE OPTIMIZED ENDPOINTS =============

// Get all unique tags (optimized for Home page)
exports.getAllTags = async (req, res) => {
  try {
    console.log('🏷️ Fetching all unique tags...');
    
    // Use MongoDB aggregation to get unique tags efficiently
    const uniqueTags = await Data.aggregate([
      { $unwind: '$tags' },
      { $match: { tags: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$tags' } },
      { $project: { _id: 0, tag: '$_id' } },
      { $sort: { tag: 1 } }
    ]);
    
    const tagsArray = uniqueTags.map(item => item.tag.trim()).filter(tag => tag);
    
    console.log(`✅ Found ${tagsArray.length} unique tags`);
    
    res.json({
      success: true,
      totalTags: tagsArray.length,
      tags: tagsArray
    });
    
  } catch (error) {
    console.error('❌ Error fetching unique tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};

// Get random tags (optimized for Home page)
exports.getRandomTags = async (req, res) => {
  try {
    const { count = 64 } = req.query;
    const tagCount = parseInt(count);
    
    console.log(`🎲 Fetching ${tagCount} random tags...`);
    
    // Use MongoDB aggregation to get random tags efficiently
    const randomTags = await Data.aggregate([
      { $unwind: '$tags' },
      { $match: { tags: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$tags' } },
      { $sample: { size: tagCount } },
      { $project: { _id: 0, tag: '$_id' } }
    ]);
    
    const tagsArray = randomTags.map(item => item.tag.trim()).filter(tag => tag);
    
    console.log(`✅ Generated ${tagsArray.length} random tags`);
    
    res.json({
      success: true,
      count: tagsArray.length,
      tags: tagsArray
    });
    
  } catch (error) {
    console.error('❌ Error fetching random tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching random tags',
      error: error.message
    });
  }
};

// Get posts by specific tag with pagination (optimized for Tag pages)
exports.getPostsByTag = async (req, res) => {
  try {
    const { tagName } = req.params;
    const { page = 1, limit = 16 } = req.query;
    
    if (!tagName) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }
    
    console.log(`🏷️ Fetching posts for tag: "${tagName}", page: ${page}, limit: ${limit}`);
    
    // Normalize tag for search (handle both "cum in pussy" and "cum-in-pussy" formats)
    const normalizedTag = tagName.toLowerCase().trim();
    const spaceTag = normalizedTag.replace(/-/g, ' ');
    const hyphenTag = normalizedTag.replace(/\s+/g, '-');
    
    // Create regex patterns for flexible tag matching
    const tagRegexPatterns = [
      new RegExp(`^${escapeRegex(normalizedTag)}$`, 'i'),
      new RegExp(`^${escapeRegex(spaceTag)}$`, 'i'),
      new RegExp(`^${escapeRegex(hyphenTag)}$`, 'i')
    ];
    
    // Build query to match any of the tag patterns
    const query = {
      tags: {
        $in: tagRegexPatterns
      }
    };
    
    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch posts with tag filter, sorting, and pagination
    const [posts, totalCount] = await Promise.all([
      Data.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Data.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    console.log(`✅ Found ${posts.length} posts for tag "${tagName}" (${totalCount} total, page ${page}/${totalPages})`);
    
    res.json({
      success: true,
      tag: tagName,
      totalRecords: totalCount,
      totalPages,
      currentPage: parseInt(page),
      records: posts
    });
    
  } catch (error) {
    console.error('❌ Error fetching posts by tag:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts by tag',
      error: error.message
    });
  }
};

// Get tag images (optimized for Home page tag grid)
exports.getTagImages = async (req, res) => {
  try {
    const { tags } = req.body; // Expecting array of tag names
    
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tags array is required'
      });
    }
    
    console.log(`🖼️ Fetching images for ${tags.length} tags...`);
    
    const tagImages = {};
    const usedImageUrls = new Set();
    
    // Process tags in parallel for better performance
    await Promise.all(tags.map(async (tag) => {
      try {
        const normalizedTag = tag.toLowerCase().trim();
        const spaceTag = normalizedTag.replace(/-/g, ' ');
        const hyphenTag = normalizedTag.replace(/\s+/g, '-');
        
        // Create regex patterns for flexible tag matching
        const tagRegexPatterns = [
          new RegExp(`^${escapeRegex(normalizedTag)}$`, 'i'),
          new RegExp(`^${escapeRegex(spaceTag)}$`, 'i'),
          new RegExp(`^${escapeRegex(hyphenTag)}$`, 'i')
        ];
        
        // Find posts with this tag that have images
        const postsWithImages = await Data.find({
          tags: { $in: tagRegexPatterns },
          imageUrl: { $exists: true, $ne: null, $ne: '' }
        })
        .sort({ createdAt: -1 })
        .limit(10) // Get top 10 recent posts with images
        .select('imageUrl');
        
        // Find first unused image or fallback to first image
        let selectedImage = null;
        for (const post of postsWithImages) {
          if (!usedImageUrls.has(post.imageUrl)) {
            selectedImage = post.imageUrl;
            usedImageUrls.add(post.imageUrl);
            break;
          }
        }
        
        // If no unique image found, use first available
        if (!selectedImage && postsWithImages.length > 0) {
          selectedImage = postsWithImages[0].imageUrl;
        }
        
        tagImages[tag] = selectedImage;
        
      } catch (err) {
        console.error(`Error fetching image for tag "${tag}":`, err);
        tagImages[tag] = null;
      }
    }));
    
    const successCount = Object.values(tagImages).filter(img => img !== null).length;
    console.log(`✅ Fetched images for ${successCount}/${tags.length} tags`);
    
    res.json({
      success: true,
      tagImages,
      stats: {
        requested: tags.length,
        found: successCount,
        uniqueImages: usedImageUrls.size
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching tag images:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tag images',
      error: error.message
    });
  }
};

// Get unique tags and pornstars from a specific tag's posts (for Tag page metadata)
exports.getTagMetadata = async (req, res) => {
  try {
    const { tagName } = req.params;
    
    if (!tagName) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }
    
    console.log(`📊 Fetching metadata for tag: "${tagName}"`);
    
    const normalizedTag = tagName.toLowerCase().trim();
    const spaceTag = normalizedTag.replace(/-/g, ' ');
    const hyphenTag = normalizedTag.replace(/\s+/g, '-');
    
    const tagRegexPatterns = [
      new RegExp(`^${escapeRegex(normalizedTag)}$`, 'i'),
      new RegExp(`^${escapeRegex(spaceTag)}$`, 'i'),
      new RegExp(`^${escapeRegex(hyphenTag)}$`, 'i')
    ];
    
    // Use aggregation to get unique tags and pornstars efficiently
    const [uniqueTagsResult, uniquePornstarsResult] = await Promise.all([
      // Get unique tags from posts with this tag
      Data.aggregate([
        { $match: { tags: { $in: tagRegexPatterns } } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags' } },
        { $project: { _id: 0, tag: '$_id' } }
      ]),
      
      // Get unique pornstars from posts with this tag
      Data.aggregate([
        { $match: { tags: { $in: tagRegexPatterns } } },
        { $unwind: '$name' },
        { $match: { name: { $exists: true, $ne: null, $ne: '' } } },
        { $group: { _id: '$name' } },
        { $project: { _id: 0, name: '$_id' } }
      ])
    ]);
    
    const uniqueTags = uniqueTagsResult.map(item => item.tag.trim().toLowerCase().replace(/\s+/g, '-')).filter(tag => tag);
    const uniquePornstars = uniquePornstarsResult.map(item => item.name.trim()).filter(name => name);
    
    console.log(`✅ Found ${uniqueTags.length} unique tags and ${uniquePornstars.length} unique pornstars for tag "${tagName}"`);
    
    res.json({
      success: true,
      tag: tagName,
      uniqueTags,
      uniquePornstars,
      stats: {
        tagsCount: uniqueTags.length,
        pornstarsCount: uniquePornstars.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching tag metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tag metadata',
      error: error.message
    });
  }
};

// Helper function to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============= PORNSTAR OPTIMIZED ENDPOINTS =============

// Get all unique pornstar names with pagination (optimized for Pornstars page)
exports.getAllPornstars = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const letter = req.query.letter; // Optional letter filter (A-Z)
    const search = req.query.search; // Optional search filter
    
    console.log(`🌟 getAllPornstars: page=${page}, limit=${limit}, letter=${letter}, search=${search}`);
    
    // Build aggregation pipeline to get unique pornstar names
    const pipeline = [
      {
        $unwind: "$name" // Unwind the name array
      },
      {
        $match: {
          name: { $exists: true, $ne: null, $ne: "" }
        }
      }
    ];
    
    // Add letter filter if provided
    if (letter && letter.length === 1) {
      pipeline.push({
        $match: {
          name: { $regex: `^${escapeRegex(letter)}`, $options: 'i' }
        }
      });
    }
    
    // Add search filter if provided
    if (search && search.trim()) {
      pipeline.push({
        $match: {
          name: { $regex: escapeRegex(search.trim()), $options: 'i' }
        }
      });
    }
    
    // Group by name to get unique values and count
    pipeline.push(
      {
        $group: {
          _id: { $toLower: "$name" },
          originalName: { $first: "$name" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { originalName: 1 } // Sort alphabetically
      }
    );
    
    // Get total count for pagination
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Data.aggregate(totalPipeline);
    const totalCount = totalResult.length > 0 ? totalResult[0].total : 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Add pagination
    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );
    
    const result = await Data.aggregate(pipeline);
    
    const pornstars = result.map(item => ({
      name: item.originalName,
      count: item.count
    }));
    
    console.log(`✅ getAllPornstars: Found ${pornstars.length} pornstars for page ${page}/${totalPages}`);
    
    res.json({
      success: true,
      pornstars,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('❌ Error in getAllPornstars:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pornstars',
      error: error.message
    });
  }
};

// Get random images for pornstars (optimized for Pornstars page)
exports.getPornstarImages = async (req, res) => {
  try {
    const { names } = req.body; // Array of pornstar names
    
    if (!names || !Array.isArray(names) || names.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Names array is required'
      });
    }
    
    console.log(`🖼️ getPornstarImages: Fetching images for ${names.length} pornstars`);
    
    const images = {};
    
    // Use Promise.all to fetch images for all pornstars in parallel
    await Promise.all(names.map(async (name) => {
      try {
        // Find a random post for this pornstar
        const posts = await Data.aggregate([
          {
            $match: {
              name: { $in: [name] },
              imageUrl: { $exists: true, $ne: null, $ne: "" }
            }
          },
          { $sample: { size: 1 } }, // Get one random post
          {
            $project: {
              imageUrl: 1,
              title: 1,
              slug: 1
            }
          }
        ]);
        
        if (posts.length > 0) {
          images[name] = {
            image: posts[0].imageUrl,
            title: posts[0].title,
            slug: posts[0].slug
          };
        }
      } catch (err) {
        console.error(`Error fetching image for ${name}:`, err);
      }
    }));
    
    console.log(`✅ getPornstarImages: Found images for ${Object.keys(images).length}/${names.length} pornstars`);
    
    res.json({
      success: true,
      images
    });
    
  } catch (error) {
    console.error('❌ Error in getPornstarImages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pornstar images',
      error: error.message
    });
  }
};

// ============= FOOTER OPTIMIZED ENDPOINTS =============

// Get random tags for footer (optimized)
exports.getFooterTags = async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 30;
    const selectedTag = req.query.selectedTag;
    const pageTags = req.query.pageTags ? req.query.pageTags.split(',') : null;
    
    console.log(`🏷️ getFooterTags: count=${count}, selectedTag=${selectedTag}, pageTags=${pageTags?.length || 0}`);
    
    // If pageTags are provided, return them
    if (pageTags && pageTags.length > 0) {
      console.log('✅ getFooterTags: Using provided page tags');
      return res.json({
        success: true,
        tags: pageTags,
        source: 'pageTags'
      });
    }
    
    // If selectedTag is provided, return it
    if (selectedTag && selectedTag.trim()) {
      console.log('✅ getFooterTags: Using selected tag');
      return res.json({
        success: true,
        tags: [selectedTag.trim()],
        source: 'selectedTag'
      });
    }
    
    // Get random tags using aggregation pipeline
    const pipeline = [
      {
        $unwind: "$tags" // Unwind the tags array
      },
      {
        $match: {
          tags: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $group: {
          _id: { $toLower: "$tags" },
          originalTag: { $first: "$tags" },
          count: { $sum: 1 }
        }
      },
      {
        $sample: { size: count } // Get random tags
      },
      {
        $sort: { originalTag: 1 } // Sort alphabetically
      }
    ];
    
    const result = await Data.aggregate(pipeline);
    const tags = result.map(item => item.originalTag);
    
    console.log(`✅ getFooterTags: Found ${tags.length} random tags`);
    
    res.json({
      success: true,
      tags,
      source: 'random'
    });
    
  } catch (error) {
    console.error('❌ Error in getFooterTags:', error);
    
    // Fallback tags
    const fallbackTags = [
      'hardcore', 'milf', 'big-tits', 'big-boobs', 'small-tits', 
      'big-ass', 'threesum', 'white', 'black', 'asian', 'latina',
      'blonde', 'brunette', 'redhead', 'teen', 'mature', 'amateur',
      'professional', 'lesbian', 'gay', 'straight', 'anal', 'oral',
      'vaginal', 'group', 'solo', 'couple', 'gangbang', 'creampie'
    ];
    
    res.json({
      success: true,
      tags: fallbackTags.slice(0, parseInt(req.query.count) || 30),
      source: 'fallback'
    });
  }
};

// Get random pornstars for footer (optimized)
exports.getFooterPornstars = async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 32;
    const tagPornstars = req.query.tagPornstars ? req.query.tagPornstars.split(',') : null;
    
    console.log(`👥 getFooterPornstars: count=${count}, tagPornstars=${tagPornstars?.length || 0}`);
    
    // Static pornstars that must always be included
    const staticPornstars = [
      'Niks Indian', 'Sunny Leone', 'Mia Khalifa', 'Dani Daniels', 'Sophia Leone',
      'Yasmina Khan', 'Alex Star', 'Blake Blossom', 'Reagan Foxx', 'Valentina Nappi', 'Natasha Nice'
    ];
    
    // If tag-specific pornstars are provided, use them
    if (tagPornstars && tagPornstars.length > 0) {
      console.log('✅ getFooterPornstars: Using tag-specific pornstars');
      
      // Filter out static pornstars from tag-specific pool to avoid duplicates
      const availableTagPornstars = tagPornstars.filter(star => 
        !staticPornstars.some(staticStar => 
          staticStar.toLowerCase().replace(/\s+/g, '') === star.toLowerCase().replace(/[\s-]+/g, '')
        )
      );
      
      // Limit to maximum 46 total pornstars (including static ones)
      const maxTotal = 46;
      const maxTagSpecific = maxTotal - staticPornstars.length; // 46 - 11 = 35
      
      // Take only the required number of tag-specific pornstars
      const limitedTagPornstars = availableTagPornstars.slice(0, maxTagSpecific);
      
      // Combine static and limited tag-specific pornstars
      const allPornstars = [...staticPornstars, ...limitedTagPornstars];
      
      // Shuffle the combined array
      const shuffledPornstars = allPornstars.sort(() => 0.5 - Math.random());
      
      console.log(`✅ getFooterPornstars: Limited to ${shuffledPornstars.length} pornstars (${staticPornstars.length} static + ${limitedTagPornstars.length} tag-specific, max 46)`);
      
      return res.json({
        success: true,
        pornstars: shuffledPornstars,
        source: 'tagSpecific'
      });
    }
    
    // Get random pornstars using aggregation pipeline
    const pipeline = [
      {
        $unwind: "$name" // Unwind the name array
      },
      {
        $match: {
          name: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $group: {
          _id: { $toLower: "$name" },
          originalName: { $first: "$name" },
          count: { $sum: 1 }
        }
      },
      {
        $sample: { size: count + 20 } // Get more than needed to filter out static ones
      }
    ];
    
    const result = await Data.aggregate(pipeline);
    const allPornstars = result.map(item => item.originalName);
    
    // Filter out static pornstars from the random pool to avoid duplicates
    const availableForRandom = allPornstars.filter(star => 
      !staticPornstars.some(staticStar => 
        staticStar.toLowerCase().replace(/\s+/g, '') === star.toLowerCase().replace(/[\s-]+/g, '')
      )
    );
    
    // Get required number of random pornstars
    const randomCount = count - staticPornstars.length;
    const randomPornstars = availableForRandom.slice(0, randomCount);
    
    // Combine static and random pornstars
    const finalPornstars = [...staticPornstars, ...randomPornstars];
    
    // Shuffle the combined array
    const shuffledPornstars = finalPornstars.sort(() => 0.5 - Math.random());
    
    console.log(`✅ getFooterPornstars: Found ${shuffledPornstars.length} pornstars (${staticPornstars.length} static + ${randomPornstars.length} random)`);
    
    res.json({
      success: true,
      pornstars: shuffledPornstars,
      source: 'random'
    });
    
  } catch (error) {
    console.error('❌ Error in getFooterPornstars:', error);
    
    // Fallback pornstars
    const fallbackPornstars = [
      'Sunny Leone', 'Mia Khalifa', 'Angela White', 'Mia Malkova', 'Johnny Sins',
      'Reagan Foxx', 'Ava Addams', 'Brandi Love', 'Cory Chase', 'Lena Paul',
      'Melody Marks', 'Keisha Grey', 'Sophia Leone', 'Bridgette B', 'Valentina Nappi',
      'Blake Blossom', 'Dani Daniels', 'Natasha Nice', 'Ariella Ferrera', 'Danny D',
      'Jordi El Nino Polla', 'Alyx Star', 'Mariska X', 'Yasmina Khan', 'Niks Indian',
      'Riley Reid', 'Abella Danger', 'Adriana Chechik', 'Kenzie Reeves', 'Autumn Falls'
    ];
    
    res.json({
      success: true,
      pornstars: fallbackPornstars.slice(0, parseInt(req.query.count) || 32),
      source: 'fallback'
    });
  }
};