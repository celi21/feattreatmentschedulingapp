import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import slugify from "slugify";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  businessName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, businessName } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate unique business slug
    let slug = slugify(businessName, { lower: true, strict: true });
    const existingBusiness = await prisma.business.findUnique({
      where: { slug }
    });
    
    if (existingBusiness) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create user and business in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
        }
      });

      const business = await tx.business.create({
        data: {
          name: businessName,
          slug,
          ownerId: user.id,
          subscriptionTier: "FREE",
        }
      });

      return { user, business };
    });

    return NextResponse.json({
      message: "Account created successfully",
      userId: result.user.id,
      businessId: result.business.id,
      businessSlug: result.business.slug,
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
