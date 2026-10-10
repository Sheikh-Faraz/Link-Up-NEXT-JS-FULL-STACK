export interface UploadedAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  filePublicId: string;
  fileResourceType: string;
  fileSize: number;
}

export async function uploadToCloudinary(
  file: File
): Promise<UploadedAttachment> {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "chat-files";

  // Get signed upload information from our server
  const signatureResponse = await fetch("/api/Cloudinary/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timestamp,
      folder,
    }),
  });

  if (!signatureResponse.ok) {
    throw new Error("Failed to prepare Cloudinary upload");
  }

  const {
    signature,
    cloudName,
    apiKey,
  } = await signatureResponse.json();

  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to upload ${file.name}`);
  }

  const data = await response.json();

  return {
    fileName: file.name,
    fileUrl: data.secure_url,
    fileType: file.type,
    filePublicId: data.public_id,
    fileResourceType: data.resource_type,
    fileSize: file.size,
  };
}