const express = require('express')
const { connection } = require('./config/mogoConnect')
const User = require('./model/user.model')
const Product = require('./model/product.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const authentication = require('./middleware/authentication')
const cors = require('cors')
 

require('dotenv').config()
const app = express()
app.use(express.json())
const port = 3000
app.use(cors())
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/products',async(req,res)=>{
  const found = await Product.find({})
    res.send(found)
})
app.post('/signup',async(req,res)=>{
    console.log(req.body);
    const {email,password} = req.body;
    const found = await User.findOne({email:email})
    if(found!=null){
        res.send({msg:"email already registered"})
    } 
    else{
        await bcrypt.hash(password, 5, function(err, hash) {
            const user =new User({
                email,password : hash
            });
            try { 
                  user.save()
                res.send({msg:"user registerd succesfully"});
            } catch (error) { 
                res.send({msg:"please try again later"})
            }
        });   
    }
})

app.post('/login',async(req,res)=>{
    const {email,password} = req.body
    const found = await User.findOne({email:email})
    if(found==null){
        res.send({msg:"invalid input"})
    } 
    else{
        const hash_password = found.password
        bcrypt.compare(password, hash_password, function(err, response) {
            if(response){
                let token = jwt.sign({user_id : found._id}, process.env.SECRET_KEY);
                
                res.send({msg : "login successfull", token : token})
                
            }
            else{
               res.status(400).send({msg:"invalid input"})
            }
        });
    }

})

app.post('/create-product',authentication, async(req,res)=>{
    const{ name, description, category, image,location,  price} = req.body
    const user_id = req.user_id 
    const product = new Product({
        name,description,category,image,location,price,user_id:user_id
    })
    try {
        product.save()
        res.send({msg:`product created`})
    } catch (error) {
        res.send({msg:"something went wrong"})
    }

})
app.get('/user-products',authentication,async(req,res)=>{
    const found = await Product.find({user_id:req.user_id})

    res.send(found) 
})
app.delete('/delete-product/:id',authentication,async(req,res)=>{
    const user_id = req.user_id
    const productId = req.params.id
    const foundProduct = Product.findById(productId)
    if(foundProduct.user_id==user_id){
        await Product.findByIdAndDelete(productId)
        res.send("product deleted")
    }
    else{
        res.send({msg:"not allowed"})
    }
})
app.listen(port, () => {
    try {
        connection
        console.log('connected to database');
    } catch (error) {
        console.log(error); 
    }
  console.log(`Example app listening on port ${port}`)
})