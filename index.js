const express = require('express');
const jwt=require("jsonwebtoken")
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config()
const app=express()
const port=process.env.PORT || 5002;



//middleware
app.use(cookieParser())
app.use(express.json())
app.use(cors({
   origin:["http://localhost:5173"],
   credentials:true,
}))









const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tgzt8q2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db("productDB").collection("product");
    
   
     
     app.post("/products",async(req,res)=>{
        try{
             const product=req.body;
             const result=await productCollection.insertOne(product)
            //  console.log(product)
            res.send(result)


        }catch(error){
           console.log(error)

        }

     }) 


     app.get("/products",async(req,res)=>{
           const cursor= productCollection.find();
           const result=await cursor.toArray()
           res.send(result)
     })

  // get single product by id

  app.get("/products/:id", async(req,res)=>{
        try{
          const id=req.params.id;
        const query= {_id:new ObjectId(id)}
        const result=await productCollection. findOne(query)
        res.send(result)
        }catch(err){
          console.log(err);
        }
  })



  


  //update data





//   app.put('/products/:id', async (req, res) => {
//     const id = req.params.id;
//     const body = req.body;
//     console.log(body);

//     const filter = { _id:new ObjectId(id) }; // Creating a filter using the provided ID

//     const updatedData = {
//         $set: {
//             ...body,
//         }
//     }

//     const option = { upsert: true }

//     try {
//         const result = await productCollection.updateOne(filter, updatedData, option);
//         res.send(result);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// });


app.put('/products/:id', async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  // Check if id is valid
  if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid ID' });
  }

  const filter = { _id: new ObjectId(id) }; 

  const updatedData = {
      $set: {
          ...body,
      }
  }

  const option = { upsert: true }

  try {
      const result = await productCollection.updateOne(filter, updatedData, option);
      res.send(result);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});




     app.delete("/products/:id",async(req,res)=>{

      try{
        const id=req.params.id;
        //  console.log(id)
         const query={_id:new ObjectId(id)}
         const result= await productCollection.deleteOne(query)
         res.send(result)
      }
      catch(err){
    console.log(err)
      }
        
     })



     app.post('/jwt',async(req,res)=>{
         const data=req.body;
        //  console.log(data)
        const token=jwt.sign(data,process.env.JWT_SECRET,{expiresIn:"1h"})

           

        const expirationDate = new Date(); // Create a new date object
        expirationDate.setDate(expirationDate.getDate() + 7); // Set it to expire 7 days from now

         res
         .cookie("token",token,{
          httpOnly:true,
          secure:false,
          expires:expirationDate,
         })
         .send ({msg:"succese",})
     })

    





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



const verify= async(req,res,next)=>{
     const token=req.cookies?.token;
     if(!token){
      res.status(401).send({status:"unAuthorized Access", code:401})
      return;
     }

     jwt.verify(token,process.env.JWT_SECRET,(err,decode)=>{
          if(err){
            res.status(401).send({status:"unAuthorized Access", code:401})
          } else{
            console.log(decode);
          }
     })

     next()
}



app.get("/", (req,res)=>{
    res.send('data will comming soon..............')
})

app.listen(port,()=>{
      console.log(`this site is going on port ${port}`)
})