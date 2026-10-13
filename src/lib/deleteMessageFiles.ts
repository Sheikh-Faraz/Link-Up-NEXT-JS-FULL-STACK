import cloudinary from "@/lib/cloudinary";
import Message from "@/models/Message";

const deleteCloudinaryFile = async (
  publicId: string,
  resourceType: string = "image"
) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || "image",
    });
  } catch (error) {
    console.error(`Failed to delete Cloudinary file: ${publicId}`, error);
  }
};

export const deleteMessageFiles = async (message: any) => {
  const files = new Map<string, string>();

  // Collect files from the message's attachments.
  for (const attachment of message.attachments ?? []) {
    if (attachment.filePublicId) {
      files.set(
        attachment.filePublicId,
        attachment.fileResourceType || "image"
      );
    }
  }

  // Support older messages with single-file fields.
  if (message.filePublicId) {
    files.set(
      message.filePublicId,
      message.fileResourceType || "image"
    );
  }

  // Include files stored in reply snapshots.
  for (const reply of message.replyTo ?? []) {
    if (reply.filePublicId) {
      files.set(
        reply.filePublicId,
        reply.fileResourceType || "image"
      );
    }
  }

  await Promise.all(
    Array.from(files.entries()).map(async ([publicId, resourceType]) => {
      const referencedElsewhere = await Message.exists({
        ...(message._id ? { _id: { $ne: message._id } } : {}),
        $or: [
          { filePublicId: publicId },
          { "attachments.filePublicId": publicId },
          { "replyTo.filePublicId": publicId },
        ],
      });

      // Keep the file if any other message still uses it.
      if (referencedElsewhere) return;

      await deleteCloudinaryFile(publicId, resourceType);
    })
  );
};


// import cloudinary from "@/lib/cloudinary";

// const deleteCloudinaryFile = async (
//   publicId: string,
//   resourceType: string = "image"
// ) => {
//   if (!publicId) return;

//   try {
//     await cloudinary.uploader.destroy(publicId, {
//       resource_type: resourceType || "image",
//     });

//     console.log(`Cloudinary file deleted: ${publicId}`);
//   } catch (error) {
//     console.error(
//       `Failed to delete Cloudinary file: ${publicId}`,
//       error
//     );
//   }
// };

// export const deleteMessageFiles = async (message: any) => {
//   const files = new Map<
//     string,
//     string
//   >();

//   // ----------------------------------------------------------
//   // 1. New attachments
//   // ----------------------------------------------------------

//   if (message.attachments?.length) {
//     for (const attachment of message.attachments) {
//       if (attachment.filePublicId) {
//         files.set(
//           attachment.filePublicId,
//           attachment.fileResourceType || "image"
//         );
//       }
//     }
//   }

//   // ----------------------------------------------------------
//   // 2. Legacy single-file fields
//   // ----------------------------------------------------------

//   if (message.filePublicId) {
//     files.set(
//       message.filePublicId,
//       message.fileResourceType || "image"
//     );
//   }

//   // ----------------------------------------------------------
//   // 3. Files inside replyTo
//   // ----------------------------------------------------------

//   if (message.replyTo?.length) {
//     for (const reply of message.replyTo) {
//       if (reply.filePublicId) {
//         files.set(
//           reply.filePublicId,
//           reply.fileResourceType || "image"
//         );
//       }
//     }
//   }

//   // ----------------------------------------------------------
//   // Delete everything from Cloudinary
//   // ----------------------------------------------------------

//   await Promise.all(
//     Array.from(files.entries()).map(
//       ([publicId, resourceType]) =>
//         deleteCloudinaryFile(publicId, resourceType)
//     )
//   );
// };