// src/app/api/migrate/posts/route.ts
import { NextResponse } from "next/server";
import { migratePosts } from "@/utils/migratePosts";

export async function POST() {
  try {
    await migratePosts();

    return NextResponse.json({
      success: true,
      message: "Posts migration complete!",
    });
  } catch (error) {
    console.error("❌ Migration error (posts):", error);

    return NextResponse.json(
      {
        success: false,
        message: "Posts migration failed.",
      },
      { status: 500 }
    );
  }
}
