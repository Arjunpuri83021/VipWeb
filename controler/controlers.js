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
      tags: updatedTags,
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