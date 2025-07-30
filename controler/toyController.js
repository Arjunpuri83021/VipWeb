const ProductModel = require("../model/product.model");

const AllOrdersModel = require("../model/allorders.model");
const UserModel = require("../model/userregister.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


  /// Controler Apis
  const Product = async (req, res) => {
    // clothe prodect add api proccess
    const { titel, desc, price, Category } = req.body;
    const image = req.file.filename;
    try {
      const record = new ProductModel({
        // database insert process
        image: image,
        titel: titel,
        desc: desc,
        price: price,
        Category: Category,
      });
      await record.save(); // save in database
      console.log(record);
      res.json({ statusCode: 202, message: "success", data: record });
    } catch (err) {
      res.json({ statusCode: 404, message: "Failed" + err, data: null });
    }
  };
const getAllProduct = async (req, res) => {
  // this is for find clothe data
  try {
    const AllProduct = await ProductModel.find();
    const CountProduct = await ProductModel.countDocuments();
    res.json({
      statusCode: 200,
      message: "success",
      data: AllProduct,
      count: CountProduct,
    });
  } catch (err) {
    res.json({
      statusCode: 404,
      message: "Failed" + err,
      data: null,
    });
  }
};

const getClothe = async (req, res) => {
  // this is for find clothe data
  try {
    const ClothFind = await ProductModel.find({ Category: "clothes" });
    res.json({
      statusCode: 200,
      message: "success",
      data: ClothFind,
    });
  } catch (err) {
    res.json({
      statusCode: 404,
      message: "Failed" + err,
      data: null,
    });
  }
};

const getAllElectronic = async (req, res) => {
  // this is for find Electronic data
  try {
    const ClothFind = await ProductModel.find({ Category: "electronics" });
    res.json({
      statusCode: 200,
      message: "success",
      data: ClothFind,
    });
  } catch (err) {
    res.json({
      statusCode: 404,
      message: "Failed" + err,
      data: null,
    });
  }
};

const getAllGrocery = async (req, res) => {
  // this is for find Grocery data

  try {
    const ClothFind = await ProductModel.find({ Category: "grocery" });
    res.json({
      statusCode: 200,
      message: "success",
      data: ClothFind,
    });
  } catch (err) {
    res.json({
      statusCode: 404,
      message: "Failed" + err,
      data: null,
    });
  }
};

const deleteProduct = async (req, res) => {
  /// this for delete clothe product
  try {
    const id = req.params.id;
    const recordDelete = await ProductModel.findByIdAndDelete(id);
    res.json({
      statusCode: 200,
      message: "successfully deleted",
      data: recordDelete,
    });
  } catch (err) {
    res.json({
      statusCode: 404,
      message: "Failed" + err,
      data: null,
    });
  }
};

const showeditvalues = async (req, res) => {
  // this is for show values in clothe edit modal
  try {
    const id = req.params.id;
    const record = await ProductModel.findById(id);
    res.json({
      statusCode: 200,
      message: "success",
      data: record,
    });
  } catch (err) {
    res.json({
      statusCode: 404,
      message: "Failed" + err,
      data: null,
    });
  }
};

const updateProduct = async (req, res) => {
  // this is for edit clothe values
  const id = req.params.id;
  if (req.file !== undefined) {
    const updateClotheRecord = await ProductModel.findByIdAndUpdate(id, {
      image: req.file.filename,
      titel: req.body.titel,
      desc: req.body.desc,
      price: req.body.price,
      Category: req.body.Category,
    });
  } else {
    const updateClotheRecord = await ProductModel.findByIdAndUpdate(id, {
      titel: req.body.titel,
      desc: req.body.desc,
      price: req.body.price,
      Category: req.body.Category,
    });
  }
  res.json({
    statusCode: 200,
    message: "successfully updated",
  });
};

const idsprodects = async (req, res) => {
  // this is for get multipul ids value
  //   console.log(req.body.ids)
  const ids = req.body.ids;
  const record = await ProductModel.find({ _id: { $in: ids } });
  res.json(record);
};

const checkout = async (req, res) => {
    console.log(req.body)
  try {
    const record = new AllOrdersModel({
        user_id: req.body.userId,
      product_id: req.body.checkOutdata.item,
      email: req.body.email,
      fname: req.body.fname,
      country: req.body.country,
      lname: req.body.lname,
      street: req.body.street,
      apartment: req.body.apartment,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      pnumber: req.body.pnumber,
      Payment: req.body.Payment,
    });

    const savedRecord = await record.save();
    console.log(savedRecord); // Log the saved record details

    res.json({ message: 'Order placed successfully', data: savedRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};



const findCheckout = async (req, res) => {
  // this for show user cheackout data and addresss
  const record = await AllOrdersModel.find();
  const countorders = await AllOrdersModel.countDocuments();
  await res.json({
    status: 202,
    data: record,
    count: countorders,
  });
  //    console.log(record)
};

const deleteOrder = async (req, res) => {
  try {
    const record = await AllOrdersModel.findByIdAndDelete(req.params.id);
    res.json(record);
  } catch (error) {
    console.log(error);
  }
};

const findorders = async (req, res) => {
  // console.log(req.body.ids)
  // const ids = req.body.ids;
  // const record = await OrderModel.find({ _id: { $in: ids } });
  // res.json(record);
};


const findUserOrder = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const records = await AllOrdersModel.find({ user_id: userId });
  
      if (!records || records.length === 0) {
        return res.status(404).json({ message: 'No orders found for this user' });
      }
  
      console.log(records);
      res.json(records);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch user orders' });
    }
  };

const productbyid = async (req, res) => {
  /// this is for find products by id from product model
  const record = await ProductModel.findById(req.params.id);
  res.json(record);
};

const userregister = async (req, res) => {
  /// this is for register user
  // console.log(req.body);
  
  const profile =req.file.filename;
   const { email, name, number, password } = req.body;
   const hashedPassword = await bcrypt.hash(password, 10);

   const userCheck= await UserModel.findOne({email:email})
   
   if(userCheck==null){

    try{
  const record=new UserModel({ email: email, name: name, number:number, password: hashedPassword , profile: profile });
    await record.save();
    console.log(record)
   res.status(201).json({ message: 'User registered successfully', data: record });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
}
else{
   res.json({message:"email is already used"})
}

};

const userlogin = async (req, res) => {
  /// this is for user login with JWT
  try {
    const { email, password } = req.body;
    // Verify credentials
    const user = await UserModel.findOne({ email:email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, "secret_key", {
      expiresIn: "1h",
    });
    res.json({ message: "successFully login", data: user, token ,userId: user._id});
  } catch (error) {
    res.status(500).json({ error: "Login failed" + error });
  }
};


const findusers = async(req, res) => {
 const record= await UserModel.find()
 const userCount = await UserModel.countDocuments()
  res.json({record, userCount});
}




module.exports = {
  /// export all components
  Product,
  getClothe,
  deleteProduct,
  showeditvalues,
  updateProduct,
  getAllProduct,
  getAllElectronic,
  getAllGrocery,
  idsprodects,
  checkout,
  findCheckout,
  findorders,
  productbyid,
  userregister,
  userlogin,
  deleteOrder,
  findusers,
  findUserOrder,
  
};
