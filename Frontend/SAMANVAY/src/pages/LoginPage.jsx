import { Login } from '@/components/auth/Login';

function LoginPage() {
    return (
        // Using the same animated background for consistency
        <div className="min-h-screen w-full flex items-center justify-center p-4
                        bg-gradient-to-br from-blue-50 to-indigo-100
                        dark:from-gray-900 dark:to-black
                        relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10">
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-purple-700"></div>
                <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-yellow-700"></div>
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-700"></div>
            </div>

            <div className="relative z-10">
                <Login />
            </div>
        </div>
    );
}

export default LoginPage;