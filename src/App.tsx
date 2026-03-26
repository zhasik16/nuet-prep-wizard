import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import Index from "./pages/Index";
import Practice from "./pages/Practice";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import About from "./pages/About";
import Donate from "./pages/Donate";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import StudyGuides from "./pages/StudyGuides";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
// Import AI components
import AIAssistant from "@/components/AIAssistant";
import StudyReminder from "@/components/StudyReminder";

// Get your publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if the key exists
if (!clerkPubKey) {
  throw new Error(
    "Missing Publishable Key - please add VITE_CLERK_PUBLISHABLE_KEY to your .env file",
  );
}

const queryClient = new QueryClient();

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

const App = () => (
  <ClerkProvider publishableKey={clerkPubKey}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes - require authentication */}
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <Practice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:testId"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-guides"
              element={
                <ProtectedRoute>
                  <StudyGuides />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donate"
              element={
                <ProtectedRoute>
                  <Donate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faq"
              element={
                <ProtectedRoute>
                  <FAQ />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <ProtectedRoute>
                  <Contact />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        {/* Global AI Components - Only show when user is signed in */}
        <SignedIn>
          <AIAssistant />
          <StudyReminder />
        </SignedIn>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
