const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    description:{
        type:String
    },
    category:{
        type:String
    },
    image:{
        type:String
    },
    location:{
        type:String
    },
    postedAt:{
        type:Date,
        default:Date.now
    },
    price:{
        type:Number
    },
    user_id:{
        type:String
    }


    
})
const Product = mongoose.model('Product', productSchema);
module.exports = Product