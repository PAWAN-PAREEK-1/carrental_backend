import multer from 'multer'
import {v2 as cloudinary} from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';




cloudinary.config({ 
    cloud_name: 'dzmcglu6i', 
    api_key: '251842564939517', 
    api_secret: '6Bjy2NjuHQSdCQSgBClSEgfNRw4' 
  });



  const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"user",
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'pdf']
    }
  });

 export const upload = multer({
        storage:storage
  })

  