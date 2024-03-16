import express from 'express';
import { routes } from './routes/index.js';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors'
import path from 'path'; 
// import { fileURLToPath } from 'url';
// import { upload } from './multer.js';


// Load environment variables from .env file
dotenv.config();




const app = express();

const port = process.env.PORT || 3000;

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())
// app.use("/api/admin" , require("./routes/adminRoute"))
app.use("/api", routes)



//  upload testing code




// // Get the directory name of the current module
// const __filename = fileURLToPath(import.meta.url);
// // Get the directory name of the current module
// const __dirname = path.dirname(__filename);

// app.get('/upload', (req, res) => {
//     // Construct the absolute path to index.html using path.resolve()
//     const indexPath = path.resolve(__dirname, 'public', 'index.html');
//     // Send the index.html file
//     res.sendFile(indexPath);
// });




// app.post('/upload/file', upload.single('file'), (req, res) => {

//     try {
//         if (!req.file) {
//             return res.status(400).send('No file uploaded.');
//         }
    
//         // Access file details from req.file
//         const fileName = req.file.filename;
//         const originalName = req.file.originalname;
//         const fileSize = req.file.size;
    
//         // You can perform further processing here if needed
//         console.log(req.file)
//         // Send response with file details
//         res.send({
//             fileName: fileName,
//             originalName: originalName,
//             fileSize: fileSize
//         });
        
//     } catch (error) {
//        console.log(error) 
//     }
   
// });






app.listen(port, () => {
    console.log(`server listening on ${port}`);
});