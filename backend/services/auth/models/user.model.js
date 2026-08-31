import mongoose from "mongoose";

const userSchema =new mongoose.Schema({    //schema is a blueprint of how the data will be stored in the database
  firebaseUid:{     //firebase use kr rhe he for unique id 
    type:String,
    unique:true
  }, 

  name:String,

  email:String,

  avatar:String,   //google se avatar (img) ka url milega 

  provider:String,
  plan:{

    type:String,

    default:"free"

},

credits:{

    type:Number,

    default:100

},

totalCredits:{

    type:Number,

    default:100

},

planExpiresAt:Date
},
{
  timestamps:true  //jb user create hoga to createdAt and updatedAt ka field automatically add ho jaega
});

const User= mongoose.model("User",userSchema); //model is a class that we can use to create, read, update and delete documents in the database 
export default User   //taki har jagah use kr paye 