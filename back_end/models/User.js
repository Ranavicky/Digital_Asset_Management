import mongoose from "mongoose";

const userSchema=mongoose.Schema({
    iss:String,
    azp:String,
    aud:String,
    sub:{
        type:String,
        required:true
    },
    email:String,
    email_verified:Boolean,
    nbf:String,
    name:{
        type:String,
        required:true
    },
    picture:{
        type:String,
        required:true
    },
    given_name:String,
    family_name:String,
    locale:String,
    iat:Number,
    exp:Number,
    jti:String
})

const user = mongoose.model('user',userSchema);

export default user;