import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // 1. Import the useAuth hook
import { ArrowLeft, Loader2 } from 'lucide-react';
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

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth(); // 2. Get the login function from our context
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false); // State to handle loading indicator

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    // 3. Updated handleSubmit function to call the backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        try {
            // The login function in AuthContext now handles the API call and redirection
            await login(formData.email, formData.password);
            // Navigation will happen inside the login function upon success
        } catch (error) {
            console.error("Login Failed:", error);
            alert(error.message || "An error occurred during login.");
            setLoading(false); // Stop loading on error
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="relative flex justify-center items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-0"
                        onClick={() => navigate('/')}
                        aria-label="Back to home"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-center">
                        <CardTitle className="text-2xl">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to your SAMANVAY account.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@gov.in"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <a href="#" className="text-sm font-medium text-primary hover:underline">
                                Forgot password?
                            </a>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                        Don't have an account?{" "}
                        <a href="/signup" className="underline font-semibold hover:text-primary">
                            Sign Up
                        </a>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
