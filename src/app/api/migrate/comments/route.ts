// src/app/api/migrate/comments/route.ts
import { NextResponse } from "next/server";
import { migrateCommentsFillNicknames } from "@/utils/migrateComments";

export async function POST() {
  try {
    await migrateCommentsFillNicknames();

    return NextResponse.json({
      success: true,
      message: "Comments migration complete!",
    });
  } catch (error) {
    console.error("❌ Migration error (comments):", error);

    return NextResponse.json(
      {
        success: false,
        message: "Comments migration failed.",
      },
      { status: 500 }
    );
  }
}
