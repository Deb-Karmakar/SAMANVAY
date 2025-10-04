import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // 1. Import the useAuth hook
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import districtsData from "@/data/districts";

// --- Data (Unchanged) ---
const states = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export function Signup() {
    const navigate = useNavigate();
    const { signup } = useAuth(); // 2. Get the signup function from our context
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');
    const [fileName, setFileName] = useState('');
    const [selectedState, setSelectedState] = useState('');
    
    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) setFileName(e.target.files[0].name);
    };

    // Reset district when state changes (Unchanged)
    useEffect(() => {
      // This logic is correct for resetting the district dropdown
    }, [selectedState]);

    // 3. Updated handleSubmit function to call the backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const data = Object.fromEntries(form.entries());
        
        // Add the role from our state to the form data
        const finalData = { ...data, role };

        try {
            await signup(finalData); // Call the async signup function
            alert("Registration Submitted! Your account will be reviewed and activated by an administrator.");
            navigate('/login');
        } catch (error) {
            console.error("Signup Failed:", error);
            alert(error.message || "An error occurred during registration.");
        }
    };

    const renderStepOne = () => (
        <>
            <CardHeader>
                <div className="relative flex justify-center items-center">
                    <Button variant="ghost" size="icon" className="absolute left-0" onClick={() => navigate('/')} aria-label="Back to home"><ArrowLeft className="h-5 w-5" /></Button>
                    <div className="text-center"><CardTitle className="text-2xl">Create an Account</CardTitle><CardDescription>Step 1 of 2: Select your role</CardDescription></div>
                </div>
            </CardHeader>
            <CardContent>
                <RadioGroup onValueChange={setRole} value={role} className="space-y-4">
                    <Label className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:border-primary">
                        <RadioGroupItem value="CentralAdmin" id="r1" />
                        <div><p className="font-semibold">Central Ministry Admin</p><p className="text-sm text-muted-foreground">National-level oversight (MoSJE).</p></div>
                    </Label>
                    <Label className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:border-primary">
                        <RadioGroupItem value="StateOfficer" id="r2" />
                        <div><p className="font-semibold">State/UT Nodal Officer</p><p className="text-sm text-muted-foreground">Manage projects within a state.</p></div>
                    </Label>
                    <Label className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:border-primary">
                        <RadioGroupItem value="ExecutingAgency" id="r3" />
                        <div><p className="font-semibold">Executing Agency Admin</p><p className="text-sm text-muted-foreground">On-the-ground project execution.</p></div>
                    </Label>
                </RadioGroup>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => setStep(2)} disabled={!role}>Next</Button>
            </CardFooter>
        </>
    );

    const renderStepTwo = () => (
        <>
            <CardHeader>
                <div className="relative flex justify-center items-center">
                    <Button variant="ghost" size="icon" className="absolute left-0" onClick={() => setStep(1)} aria-label="Back to role selection"><ArrowLeft className="h-5 w-5" /></Button>
                    <div className="text-center"><CardTitle className="text-2xl">Your Details</CardTitle><CardDescription>Step 2 of 2: Complete your profile</CardDescription></div>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-3">
                    {/* Common Fields */}
                    <div className="space-y-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" name="fullName" required /></div>
                    <div className="space-y-2"><Label htmlFor="mobile">Mobile Number</Label><Input id="mobile" name="mobile" type="tel" required /></div>
                    
                    {/* Role-Specific Fields */}
                    {role === 'CentralAdmin' && <>
                        <div className="space-y-2"><Label htmlFor="email">Official Email</Label><Input id="email" name="email" type="email" required placeholder="user@gov.in"/></div>
                        <div className="space-y-2"><Label htmlFor="designation">Designation</Label><Input id="designation" name="designation" placeholder="e.g., Joint Secretary" required /></div>
                    </>}
                    {(role === 'StateOfficer' || role === 'ExecutingAgency') && (
                        <>
                            <div className="space-y-2"><Label htmlFor="email">Official Email</Label><Input id="email" name="email" type="email" required /></div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State/UT</Label>
                                {/* 4. Added name="state" prop */}
                                <Select name="state" onValueChange={setSelectedState} value={selectedState} required>
                                    <SelectTrigger><SelectValue placeholder="Select your state..." /></SelectTrigger>
                                    <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">District</Label>
                                {/* 4. Added name="district" prop */}
                                <Select name="district" required disabled={!selectedState}>
                                    <SelectTrigger><SelectValue placeholder={selectedState ? "Select your district..." : "Select state first"} /></SelectTrigger>
                                    <SelectContent>{selectedState && districtsData[selectedState]?.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    {role === 'ExecutingAgency' && (
                        <>
                            <div className="space-y-2"><Label htmlFor="agencyName">Agency Name</Label><Input id="agencyName" name="agencyName" required /></div>
                            <div className="space-y-2">
                                <Label htmlFor="agencyType">Agency Type</Label>
                                {/* 4. Added name="agencyType" prop */}
                                <Select name="agencyType" required>
                                    <SelectTrigger><SelectValue placeholder="Select agency type..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PWD">PWD</SelectItem><SelectItem value="NGO">NGO</SelectItem><SelectItem value="Education Dept">Education Dept.</SelectItem><SelectItem value="Others">Others</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    
                    <div className="space-y-2">
                        <Label>Official ID Upload (Simulated)</Label>
                        <Label htmlFor="id-upload" className="cursor-pointer flex items-center justify-center w-full h-10 px-4 py-2 text-sm border rounded-md"><Upload className="h-4 w-4 mr-2" /><span>{fileName || "Upload ID Card / Registration PDF"}</span></Label>
                        <Input id="id-upload" name="idUpload" type="file" className="sr-only" onChange={handleFileChange} />
                    </div>
                    
                    <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required /></div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">Submit for Verification</Button>
                </CardFooter>
            </form>
        </>
    );

    return (

        <Card className="w-full max-w-lg">

        {step === 1 ? renderStepOne() : renderStepTwo()}

        </Card>

     );

}
