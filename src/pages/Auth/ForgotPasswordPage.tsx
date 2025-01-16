import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle, Check, Headphones } from "lucide-react";

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset instructions");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while sending reset instructions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full bg-black min-h-screen text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-12">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Atlantify</h1>
          </div>

          {/* Success Container */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto h-16 w-16 flex items-center justify-center bg-blue-500/20 rounded-full">
                <Check className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Check your inbox
                </h2>
                <p className="text-neutral-400">
                  We've sent password reset instructions to{" "}
                  <span className="text-white font-medium">
                    {formData.email}
                  </span>
                </p>
              </div>

              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to sign in
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-neutral-500 text-sm">
            © {new Date().getFullYear()} Atlantify. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex items-center justify-center mb-12">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Atlantify</h1>
        </div>

        {/* Main Container */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-white">
                Reset your password
              </h2>
              <p className="text-neutral-400">
                Enter your email address and we'll send you instructions to
                reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-300"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500 text-sm transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Sending instructions...</span>
                  </div>
                ) : (
                  "Send reset instructions"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-neutral-700"></div>
                <span className="mx-4 text-neutral-500 text-sm">or</span>
                <div className="flex-grow border-t border-neutral-700"></div>
              </div>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-neutral-500 text-sm">
          © {new Date().getFullYear()} Atlantify. All rights reserved.
        </div>
      </div>
    </div>
  );
};
