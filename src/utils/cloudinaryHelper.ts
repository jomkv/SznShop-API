import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import dotenv from "dotenv";
import DatabaseError from "../errors/DatabaseError";
import { IImage } from "../@types/image.types";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // use https
});

/**
 * Uploads a single image buffer to cloudinary
 *
 * @param {IImage[]} imageBuffer - Array of IImage.
 * @returns {Promise<IImage>} image - IImage.
 * @throws Database Error
 */
const uploadImage = async (imageBuffer: Buffer): Promise<IImage> => {
  const options = {
    unique_filename: false,
  };

  try {
    // Upload using buffer
    return await new Promise((resolve, reject) =>
      // * TODO: apply options
      cloudinary.uploader
        .upload_stream(options, (error, res: UploadApiResponse | undefined) => {
          if (error || !res) {
            throw new DatabaseError();
          }

          const photo: IImage = {
            url: res.url,
            publicId: res.public_id,
          };

          return resolve(photo);
        })
        .end(imageBuffer)
    );
  } catch (err) {
    throw new DatabaseError();
  }
};

/**
 * Uploads array of Multer file objects to cloudinary
 *
 * @param {IImage[]} imageUploads - Array of IImage.
 * @returns {Promise<IImage[]>} images - Array of IImage.
 * @throws Nothing
 */
const uploadImages = async (
  imageUploads: Express.Multer.File[]
): Promise<IImage[]> => {
  return await Promise.all(
    imageUploads.map(async (image: Express.Multer.File) =>
      uploadImage(image.buffer)
    )
  );
};

/**
 * Deletes document images from cloudinary
 *
 * @param {IImage[]} images - Array of IImage.
 * @throws Nothing
 */
const deleteImages = async (images: IImage[]): Promise<void> => {
  try {
    const public_ids: string[] = images.map((image) => image.publicId);

    await cloudinary.api.delete_resources(public_ids);
  } catch (err) {
    // do nothing if error
  }
};

export { uploadImage, uploadImages, deleteImages };
