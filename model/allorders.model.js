const mongoose=require('mongoose')


const MongoSchema=mongoose.Schema({
    user_id:String,
    product_id: Object,
    email: String,
   fname: String,
   country: String,
   lname: String,
   street: String,
   apartment: String,
   city: String,
   state: String,
   zip: String,
   pnumber: String,
   Payment: String
 })

 module.exports = mongoose.model("UserOrders",MongoSchema)