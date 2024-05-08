import User from "../models/User.js";

export const addUser = async (req,res)=>{
    await User.findOne({sub:req.body.sub}).then(async(user)=>{
        console.log(req.body);
        if(user)
        {
            return res.json({message:'User already exists!'});
        }
        const newUser = new User(req.body);
        await newUser.save();
        return res.status(200).json(newUser);
    }).catch((err)=>{
        return res.status(400).json({message:err.message});
    });
}