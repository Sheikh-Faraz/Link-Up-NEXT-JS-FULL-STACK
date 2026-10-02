import cloudinary from "@/lib/cloudinary"; 

export const uploadFileToCloudinary = async ( 
    file: File, 
    folder: string = "chat-files" 
): Promise<{ 
    url: string; 
    public_id: string; 
    resource_type: string; 
    format: string; 
}> => { 
    
    const bytes = await file.arrayBuffer(); 
    const buffer = Buffer.from(bytes); 
    const result: any = await new Promise((resolve, reject) => { 
        cloudinary.uploader .upload_stream( 
            { 
                folder, resource_type: "auto", 
                use_filename: true, 
                unique_filename: true, 
            }, 
            (error, result) => { 
                if (error) { 
                    console.error("Cloudinary file upload error:", error); 
                    reject(error); 
                    return; 
                } resolve(result); 
            }) 
                .end(buffer); 
            }); 

            return { 
                url: result.secure_url, 
                public_id: result.public_id, 
                resource_type: result.resource_type, 
                format: result.format, 
            }; 
        };