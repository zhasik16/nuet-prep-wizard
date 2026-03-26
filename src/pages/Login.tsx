import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Login = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate("/practice");
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">NUET Prep</h1>
          <p className="text-gray-600">Nazarbayev University Entrance Test</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <SignIn
                  routing="hash"
                  signUpUrl="#signup"
                  afterSignInUrl="/practice"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none",
                      header: "hidden",
                      footer: "hidden",
                      formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                      socialButtonsBlockButton:
                        "border-gray-300 hover:bg-gray-50",
                    },
                  }}
                />
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <SignUp
                  routing="hash"
                  signInUrl="#signin"
                  afterSignUpUrl="/practice"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none",
                      header: "hidden",
                      footer: "hidden",
                      formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                      socialButtonsBlockButton:
                        "border-gray-300 hover:bg-gray-50",
                    },
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
