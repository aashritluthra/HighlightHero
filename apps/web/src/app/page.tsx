import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { UploadButton } from "@/components/UploadButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-2">HighlightHero</h1>
      <p className="text-lg text-center text-muted-foreground max-w-md">
        Transform your favorite sports moments into stylized, viral-ready
        animations with high-fidelity sound synchronization.
      </p>
      <SignedOut>
        <div className="flex gap-4 mt-6">
          <SignInButton>
            <button className="border border-gray-600 hover:border-gray-400 text-white rounded-full font-medium text-sm h-10 px-5 cursor-pointer transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full font-medium text-sm h-10 px-5 cursor-pointer transition-colors">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <UploadButton />
      </SignedIn>
    </main>
  );
}
