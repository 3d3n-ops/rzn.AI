import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create a single supabase client for interacting with your database
export const createSupabaseClient = (supabaseAccessToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
      },
    },
  });
};

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

// Helper functions for file uploads and question generation
export const uploadFileAndGenerateQuestions = async (
  userId,
  file,
  category
) => {
  try {
    console.log("Starting uploadFileAndGenerateQuestions");

    // Get the user's session token
    const response = await fetch("/api/supabase-token");
    if (!response.ok) {
      throw new Error("Failed to get Supabase token");
    }
    const { token } = await response.json();

    // Create an authenticated Supabase client
    const supabase = createSupabaseClient(token);

    // 1. Upload file to Supabase storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`; // Store in user-specific folder

    console.log("Uploading file to storage:", { fileName, filePath });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("study_materials")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }
    console.log("File uploaded successfully");

    // 2. Create a record in the study_materials table
    console.log("Creating study material record");
    const { data: materialData, error: materialError } = await supabase
      .from("study_materials")
      .insert({
        user_id: userId,
        file_path: filePath,
        category: category,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (materialError) {
      console.error("Material record creation error:", materialError);
      throw materialError;
    }
    console.log("Study material record created:", materialData);

    // 3. Read the file content
    console.log("Reading file content");
    const fileContent = await file.text();
    console.log("File content read successfully");

    // 4. Call backend to generate questions
    console.log("Calling question generation API");
    const responseQuestion = await fetch("/api/generate-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_content: fileContent,
        file_type: fileExt,
        category: category,
      }),
    });

    if (!responseQuestion.ok) {
      const errorText = await responseQuestion.text();
      console.error("Question generation API error:", errorText);
      throw new Error("Failed to generate questions");
    }

    const { questions } = await responseQuestion.json();
    console.log("Questions generated successfully");

    // 5. Save generated questions to Supabase
    console.log("Saving questions to database");
    await saveGeneratedQuestions(userId, materialData.id, questions);
    console.log("Questions saved successfully");

    return materialData;
  } catch (error) {
    console.error("Error in uploadFileAndGenerateQuestions:", error);
    throw error;
  }
};

export const getGeneratedQuestions = async (userId, materialId) => {
  const { data, error } = await supabase
    .from("generated_questions")
    .select("*")
    .eq("material_id", materialId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

export const saveGeneratedQuestions = async (userId, materialId, questions) => {
  const { data, error } = await supabase
    .from("generated_questions")
    .insert(
      questions.map((question) => ({
        user_id: userId,
        material_id: materialId,
        text: question.text,
        equation: question.equation,
        answers: question.answers,
        correct_answer: question.correctAnswer,
        category: question.category,
        difficulty: question.difficulty,
        created_at: new Date().toISOString(),
      }))
    )
    .select();

  if (error) throw error;
  return data;
};
