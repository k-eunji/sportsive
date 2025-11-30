//src/app/api/test/route.ts

export async function GET() {
  return Response.json({
    key: process.env.FIREBASE_PRIVATE_KEY_B64?.length ?? null
  })
}

