import grid from 'gridfs-stream';
import mongoose from 'mongoose';
import ImageModel from '../models/Image.js';
import User from '../models/User.js';
import got from 'got'

const url = "http://localhost:3001";

let gfs, gridFsBucket;

const connect = mongoose.connection;
connect.once('open', ()=>{
    gridFsBucket = new mongoose.mongo.GridFSBucket(connect.db,{
        bucketName: 'fs'
    });
    gfs = grid(connect.db,mongoose.mongo);
    gfs.collection('fs');
})

export const uploadFile = async (req,res) => {
    if(!req.file){
        return res.status(404).json("File not found");
    }
    const imageUrl = `${url}/file/${req.file.filename}`;
    // console.log(req.file.filename);
    await User.findOne({sub:req.body.userId}).then(async(user)=>{
        // console.log(user);
        const newImage = new ImageModel({
            userId:user._id,
            imgUrl:imageUrl,
            publicUrl:req.body.publicUrl,
            metadata:{title:req.body.imgName}
        })
        await newImage.save();
        console.log("newImage uploaded successfully!",newImage);
    }).catch((error)=>{
        console.log("Error fetching the current user",err)
    })
    return res.status(200).json(imageUrl);
}


export const showImages = async (req, res) => {
  const { userId, text } = req.params;
  // console.log("showImages", userId, text);
  try {
    // console.log("params: ", req.params);
    const curUser = await User.findOne({ sub: userId });
    if (!curUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let images;
    if (text && text.trim() !== "") {
      images = await ImageModel.find({
        userId: curUser._id,
        $or: [
          { "metadata.title": { $regex: text, $options: "i" } },
          { "metadata.tags": { $regex: text, $options: "i" } },
          { "metadata.tagsByAI": { $regex: text, $options: "i" } }
        ]
      });
    } else {
      images = await ImageModel.find({ userId: curUser._id });
    }

    return res.status(200).json(images);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const showAllImages = async (req, res) => {
  const { userId } = req.params;
  // console.log("showAllImages", userId);
  try {
    // console.log("params: ", req.params);
    const curUser = await User.findOne({ sub: userId });
    if (!curUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const images = await ImageModel.find({ userId: curUser._id });
    return res.status(200).json(images);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


export const getImage = async (req, res) => {
    try{
        const file = await gfs.files.findOne({filename: req.params.filename});

        const readStream = gridFsBucket.openDownloadStream(file._id);
        readStream.pipe(res);
    }catch(error){
        return res.status(500).json(error.message);
    }
}

export const updateImageMetadata = async (req, res) => {
    const { userId, imgUrl, metadata } = req.body;
    const curUser = await User.findOne({sub:userId});
    const id= curUser._id;
    try {
    // console.log(userId, imgUrl, metadata);
    // console.log('id: ',id);
      const updatedImage = await ImageModel.findOneAndUpdate({ userId:id, imgUrl }, { $set: { metadata } }, { new: true });
    //   console.log('updated img: ',updatedImage);
      res.status(200).json(updatedImage);
    } catch (error) {
      console.log("Error while updating image metadata", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  export const getImageInfo = async (req, res) => {
    let imgUrl = req.params.encodedImgUrl;
    imgUrl = decodeURIComponent(imgUrl);
    // console.log('userId: ', req.params.userId);
    // console.log('url: ', imgUrl);
    const curUser = await User.findOne({sub:req.params.userId});
    // console.log('user: ', curUser);
    // console.log('_id: ', curUser._id);
    const id= curUser._id;
    try {
      const imageInfo = await ImageModel.findOne({ userId:id, imgUrl });
      // console.log('Image info', imageInfo);
      if (!imageInfo) {
        return res.status(404).json({ error: "Image not found" });
      }
      res.status(200).json(imageInfo);
    } catch (error) {
      console.log("Error while fetching image info", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }


  export const setTags = async (req, res) => {
    const apiKey = 'acc_e2bc06edadd18d1';
    const apiSecret = '19b5e56af62aa5478019521bdbd2adb8';

    let ImageUrl = req.params.encodedImgUrl;
    ImageUrl = decodeURIComponent(ImageUrl);
    console.log('imggggggggurl: ',ImageUrl);
    const imageInfo = await ImageModel.findOne({ imgUrl:ImageUrl });
    console.log('image info',imageInfo)
    if(!(imageInfo.publicUrl)){
      return res.status(500).json('URL not found')
    }
    const url = 'https://api.imagga.com/v2/tags?image_url=' + encodeURIComponent(imageInfo.publicUrl);
    console.log('public urllll',imageInfo.publicUrl)
    try {
        const response = await got(url, {username: apiKey, password: apiSecret});
        const responseBody = JSON.parse(response.body);
        const tags = responseBody.result.tags;

        // tags.sort((a, b) => b.confidence - a.confidence);
        const topTags = tags.slice(0, 15);
        console.log("Top tags",topTags);
        const aiTags = topTags.slice(0, 15).map(tagObj => tagObj.tag.en);
        const image = await ImageModel.findOne({ imgUrl:ImageUrl });
        image.metadata.tagsByAI = aiTags;
        await image.save();

        console.log('image',image);
        return res.status(200).json(topTags);
    } catch (error) {
      console.log("Error while fetching tags", error.message);
      res.status(500).json(error);
    }
  }