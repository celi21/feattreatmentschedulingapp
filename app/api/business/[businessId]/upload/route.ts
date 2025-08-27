import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: params.businessId,
        ownerId: session.user.id,
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Process image with Sharp
    const buffer = await file.arrayBuffer();
    const processedImage = await sharp(Buffer.from(buffer))
      .resize(800, 800, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // In a real implementation, you would upload to a cloud storage service
    // like AWS S3, Cloudinary, or similar. For this demo, we'll return a mock URL
    const mockImageUrl = `https://your-storage-service.com/images/${Date.now()}-${file.name}`;

    // TODO: Actually upload to your preferred cloud storage service
    // const uploadResult = await uploadToCloudStorage(processedImage, fileName);

    return NextResponse.json({
      message: "Image uploaded successfully",
      url: mockImageUrl,
      size: processedImage.length,
    });

  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function for actual cloud storage upload (implement based on your provider)
async function uploadToCloudStorage(buffer: Buffer, fileName: string): Promise<string> {
  // Example for AWS S3:
  // const s3 = new AWS.S3();
  // const uploadParams = {
  //   Bucket: process.env.S3_BUCKET_NAME,
  //   Key: `products/${fileName}`,
  //   Body: buffer,
  //   ContentType: 'image/jpeg',
  //   ACL: 'public-read'
  // };
  // const result = await s3.upload(uploadParams).promise();
  // return result.Location;

  // For now, return a mock URL
  return `https://your-storage-service.com/images/${fileName}`;
}
