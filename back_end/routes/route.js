import express from 'express';
import { addUser } from '../controller/userController.js';
import { getImage, showImages, uploadFile, updateImageMetadata, getImageInfo, showAllImages, setTags } from '../controller/imageController.js';
import upload from '../utils/upload.js';

const route=express.Router();

route.use(express.json());

route.post('/add',addUser);

route.post('/file/upload', upload.single("file"),uploadFile);
route.get('/file/:filename',getImage);


route.get('/displayImages/:userId/:text', showImages);

route.get('/displayImages/:userId', showAllImages);

route.put('/image/update', updateImageMetadata);
route.get('/image/info/:userId/:encodedImgUrl',getImageInfo);

route.get('/setTags/:encodedImgUrl', setTags);

export default route;