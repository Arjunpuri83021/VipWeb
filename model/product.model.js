const mongoose=require('mongoose')

const MongoSchema=mongoose.Schema({
    image:String,
    titel:String,
    desc:String,
    price:String,
    Category:String
})

module.exports=mongoose.model('Products',MongoSchema)


