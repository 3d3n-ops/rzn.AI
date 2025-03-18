import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Generate an access token directly
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: `user.${userId}@example.com`,
    });

    if (error || !data.properties?.access_token) {
      console.error("Error generating token:", error);
      return new NextResponse("Error generating token", { status: 500 });
    }

    // Return the token with proper headers
    return NextResponse.json(
      { token: data.properties.access_token },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error in supabase-token route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
