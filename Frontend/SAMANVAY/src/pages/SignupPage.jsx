import { Signup } from '@/components/auth/Signup';

function SignupPage() {
    return (
        // Enhanced background for the signup page
        <div className="min-h-screen w-full flex items-center justify-center p-4
                        bg-gradient-to-br from-blue-50 to-indigo-100   // Subtle gradient
                        dark:from-gray-900 dark:to-black                // Dark mode gradient
                        relative overflow-hidden">
            {/* Optional: Add some abstract shapes or patterns for visual interest */}
            <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10">
                {/* This could be an SVG pattern or just a radial gradient for a "blur" effect */}
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-purple-700"></div>
                <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-yellow-700"></div>
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-700"></div>
            </div>

            {/* The Signup component remains z-index 10 to be on top */}
            <div className="relative z-10">
                <Signup />
            </div>
        </div>
    );
}

export default SignupPage;