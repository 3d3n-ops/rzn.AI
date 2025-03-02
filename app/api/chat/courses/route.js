import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase";

export async function POST(req) {
  try {
    const { userId } = auth();
    const { courses } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validCourses = courses.filter((course) => course.name.trim() !== "");

    if (validCourses.length === 0) {
      return NextResponse.json(
        { error: "No valid courses provided" },
        { status: 400 }
      );
    }

    // Insert courses into Supabase
    const coursesToInsert = validCourses.map((course) => ({
      user_id: userId,
      name: course.name,
      description: course.description || null,
    }));

    const { data, error } = await supabase
      .from("courses")
      .insert(coursesToInsert)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, courses: data });
  } catch (error) {
    console.error("Error in courses API:", error);
    return NextResponse.json(
      { error: "Failed to save courses" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's courses
export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ courses: data });
  } catch (error) {
    console.error("Error in courses API:", error);
    return NextResponse.json(
      { error: "Failed to retrieve courses" },
      { status: 500 }
    );
  }
}
