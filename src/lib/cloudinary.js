import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';


// Optional: You can remove this if you no longer want to log the keys
console.log("cloudinary config:", process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

cloudinary.config({ 
  cloud_name: 'diiopqo1y', 
  api_key: '556316231398198',
  api_secret: "tFVVkEkNjKlic2gKQCRU6PsMROk"
});

// Helper to convert buffer to stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'app',
        public_id: filename.split('.')[0],
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary Upload Error:", error);
          return reject(error);
        }
        console.log('☁️ Uploaded to Cloudinary:', result?.secure_url);
        resolve(result?.secure_url || '');
      }
    );

    bufferToStream(buffer).pipe(stream);
  });
};

export default uploadToCloudinary;