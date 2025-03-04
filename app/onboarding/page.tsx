"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const educationLevels = [
  "High School",
  "Undergraduate",
  "Graduate",
  "Doctoral",
  "Professional",
];

interface Course {
  name: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Update Supabase client initialization with error checking
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug Supabase configuration
  console.log("Supabase URL:", supabaseUrl);
  console.log("Supabase Anon Key:", supabaseAnonKey?.substring(0, 20) + "...");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">
          Error: Missing database configuration
        </div>
      </div>
    );
  }

  // Initialize Supabase client with debug
  console.log("Initializing Supabase client...");
  const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  console.log("Supabase client initialized");

  const [name, setName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [courses, setCourses] = useState<Course[]>([{ name: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (isLoaded && !user) {
    router.push("/sign-in");
    return null;
  }

  const handleAddCourse = () => {
    setCourses([...courses, { name: "" }]);
  };

  const handleCourseChange = (index: number, value: string) => {
    const updatedCourses = [...courses];
    updatedCourses[index].name = value;
    setCourses(updatedCourses);
  };

  const handleRemoveCourse = (index: number) => {
    if (courses.length > 1) {
      const updatedCourses = courses.filter((_, i) => i !== index);
      setCourses(updatedCourses);
    }
  };

  // Initialize IndexedDB for offline access
  const initializeIndexedDBForCourse = async (courseName: string) => {
    // Implementation for IndexedDB initialization
    // This would depend on your offline strategy
    console.log(`Initializing IndexedDB for course: ${courseName}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication error",
        description: "Please sign in to continue",
        variant: "destructive",
      });
      router.push("/sign-in");
      return;
    }

    if (!name) {
      toast({
        title: "Missing information",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!educationLevel) {
      toast({
        title: "Missing information",
        description: "Please select your education level",
        variant: "destructive",
      });
      return;
    }

    const validCourses = courses.filter((course) => course.name.trim() !== "");

    if (validCourses.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one course",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Save user profile information
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          full_name: name,
          education_level: educationLevel,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw new Error(profileError.message);

      // Step 2: Save courses to Supabase
      const coursesToInsert = validCourses.map((course) => ({
        user_id: user.id,
        name: course.name,
        description: "",
        created_at: new Date().toISOString(),
      }));

      const { data: savedCourses, error: coursesError } = await supabase
        .from("courses")
        .insert(coursesToInsert)
        .select();

      if (coursesError) throw new Error(coursesError.message);

      // Step 3: Initialize IndexedDB for offline access (if needed)
      if (savedCourses) {
        for (const course of savedCourses) {
          await initializeIndexedDBForCourse(course.name);
        }
      }

      toast({
        title: "Success!",
        description: "Your profile has been set up successfully",
      });

      // Redirect to dashboard after successful submission
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Error during onboarding:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent">
              Welcome to Ryzn
            </span>
          </CardTitle>
          <CardDescription>
            Let's personalize your learning experience. Please fill out the
            following information.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Education Level</Label>
              <Select value={educationLevel} onValueChange={setEducationLevel}>
                <SelectTrigger id="education">
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level} value={level.toLowerCase()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="courses">Courses/Classes</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCourse}
                  className="flex items-center gap-1"
                >
                  <Plus size={16} /> Add Course
                </Button>
              </div>
              <CardDescription className="pb-2">
                Create folders for each course/class you are taking to store
                your study materials.
              </CardDescription>

              {courses.map((course, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Course name (e.g., Calculus)`}
                    value={course.name}
                    onChange={(e) => handleCourseChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {courses.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCourse(index)}
                      className="h-10 w-10"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
