import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for courses
export const createCourse = async (userId, courseName) => {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      user_id: userId,
      name: courseName,
      created_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  return data?.[0];
};

export const getUserCourses = async (userId) => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

export const deleteCourse = async (courseId) => {
  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) throw error;
  return true;
};
