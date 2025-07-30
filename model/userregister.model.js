const mongoose=require('mongoose')

const MongoSchema=mongoose.Schema({
        email: String,
        name: String,
        number: String,
        password: String,
        conpassword : String,
        profile: String,
})

module.exports=mongoose.model('UserRegister',MongoSchema)




