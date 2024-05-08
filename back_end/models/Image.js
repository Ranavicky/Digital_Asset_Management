import mongoose from 'mongoose';

const imageSchema = mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    imgUrl:String,
    publicUrl:String,
    metadata:{   
        title:String,
        tags:[String],
        tagsByAI:[String],
    }
})

const ImageModel = mongoose.model('image',imageSchema);
export default ImageModel;