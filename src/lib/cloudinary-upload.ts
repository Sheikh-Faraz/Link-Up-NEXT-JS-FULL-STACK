import cloudinary from "@/lib/cloudinary";

export const uploadToCloudinary = async (
  file: File,
  folder: string = "uploads"
): Promise<{
  url: string;
  public_id: string;
}> => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result: any = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
        },
        (error, result) => {
          if (error) {
            console.error("message:", error?.message);
            reject(error);
          } else {
            resolve(result);
          }
        }
      )
      .end(buffer);
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};



// import cloudinary from "@/lib/cloudinary";

// /**
//  * Upload a File to Cloudinary.
//  *
//  * Flow:
//  * 1. Receive the File from FormData.
//  * 2. Convert the File to an ArrayBuffer.
//  * 3. Convert the ArrayBuffer to a Node.js Buffer.
//  * 4. Send the Buffer to Cloudinary using upload_stream().
//  * 5. Return the Cloudinary URL and public_id.
//  *
//  * The `folder` parameter allows us to organize uploads.
//  *
//  * Example:
//  * uploadToCloudinary(file, "inkwell/profile-pictures")
//  *
//  * Cloudinary will store the image inside:
//  * inkwell/profile-pictures/
//  */

// console.log("Cloudinary env check:", {
//   cloudName: process.env.CLOUDINARY_CLOUD_NAME,
//   apiKeyLength: process.env.CLOUDINARY_API_KEY?.length,
//   apiSecretLength: process.env.CLOUDINARY_API_SECRET?.length,
// });

// export const uploadToCloudinary = async (
//   file: File,
//   folder: string = "uploads"
// ): Promise<{
//   url: string;
//   public_id: string;
// }> => {
//   // Convert the browser File into an ArrayBuffer.
//   const bytes = await file.arrayBuffer();

//   // Convert the ArrayBuffer into a Node.js Buffer.
//   const buffer = Buffer.from(bytes);

//   // Upload the Buffer to Cloudinary.
//   const result: any = await new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream(
//         {
//           // Folder where Cloudinary will store the image.
//           folder,

//           // Explicitly tell Cloudinary that this is an image.
//         //   resource_type: "image",
//         },
//         (error, result) => {
//           if (error) {
//             console.error("Cloudinary upload error:", error);
//             reject(error);
//             return;
//           }

//           resolve(result);
//         }
//       )
//       .end(buffer);
//   });

//   // Return the values needed by our application.
//   return {
//     url: result.secure_url,
//     public_id: result.public_id,
//   };
// };

