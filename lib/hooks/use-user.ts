import { useUser as useClerkUser } from "@clerk/nextjs";

export function useUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser();

  return {
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    } : null,
    isLoaded,
    isSignedIn,
  };
}
