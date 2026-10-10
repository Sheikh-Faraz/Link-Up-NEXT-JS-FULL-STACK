import cloudinary from "@/lib/cloudinary";

const deleteCloudinaryFile = async (
  publicId: string,
  resourceType: string = "image"
) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || "image",
    });

    console.log(`Cloudinary file deleted: ${publicId}`);
  } catch (error) {
    console.error(
      `Failed to delete Cloudinary file: ${publicId}`,
      error
    );
  }
};

export const deleteMessageFiles = async (message: any) => {
  const files = new Map<
    string,
    string
  >();

  // ----------------------------------------------------------
  // 1. New attachments
  // ----------------------------------------------------------

  if (message.attachments?.length) {
    for (const attachment of message.attachments) {
      if (attachment.filePublicId) {
        files.set(
          attachment.filePublicId,
          attachment.fileResourceType || "image"
        );
      }
    }
  }

  // ----------------------------------------------------------
  // 2. Legacy single-file fields
  // ----------------------------------------------------------

  if (message.filePublicId) {
    files.set(
      message.filePublicId,
      message.fileResourceType || "image"
    );
  }

  // ----------------------------------------------------------
  // 3. Files inside replyTo
  // ----------------------------------------------------------

  if (message.replyTo?.length) {
    for (const reply of message.replyTo) {
      if (reply.filePublicId) {
        files.set(
          reply.filePublicId,
          reply.fileResourceType || "image"
        );
      }
    }
  }

  // ----------------------------------------------------------
  // Delete everything from Cloudinary
  // ----------------------------------------------------------

  await Promise.all(
    Array.from(files.entries()).map(
      ([publicId, resourceType]) =>
        deleteCloudinaryFile(publicId, resourceType)
    )
  );
};