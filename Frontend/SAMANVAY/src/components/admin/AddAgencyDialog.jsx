import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // 1. Import hooks
import { axiosInstance } from "@/contexts/AuthContext"; // 1. Import axios instance
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";

// --- API function to create an agency ---
const createAgency = async (newAgency) => {
    const { data } = await axiosInstance.post('/agencies', newAgency);
    return data;
};

// --- Full list of states for the dropdown ---
const states = [ "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"];


export default function AddAgencyDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // 2. Set up the mutation for creating an agency
  const mutation = useMutation({
    mutationFn: createAgency,
    onSuccess: () => {
      // When successful, invalidate the 'agencies' query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      setOpen(false); // Close the dialog
      alert("Agency created successfully!");
    },
    onError: (error) => {
      alert(`Failed to create agency: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newAgencyData = Object.fromEntries(formData.entries());
    
    // 3. Call the mutation with the form data
    mutation.mutate(newAgencyData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Agency
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Agency</DialogTitle>
          <DialogDescription>
            Enter the details for the new agency. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form id="add-agency-form" onSubmit={handleSubmit} className="space-y-4 py-4">
            <div><Label htmlFor="name">Agency Name</Label><Input id="name" name="name" placeholder="e.g., UP Social Welfare Dept." required /></div>
            <div><Label htmlFor="type">Type</Label><Select name="type" required><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger><SelectContent><SelectItem value="Implementing">Implementing Agency</SelectItem><SelectItem value="Executing">Executing Agency</SelectItem></SelectContent></Select></div>
            <div><Label htmlFor="state">State/UT</Label><Select name="state" required><SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger><SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><Label htmlFor="district">District</Label><Input id="district" name="district" placeholder="e.g., Lucknow" required /></div>
            <div><Label htmlFor="contactPerson">Contact Person</Label><Input id="contactPerson" name="contactPerson" placeholder="e.g., Mr. Alok Sharma" /></div>
            <div><Label htmlFor="email">Contact Email</Label><Input id="email" name="email" type="email" placeholder="e.g., alok.s@up.gov.in" required /></div>
        </form>
        <DialogFooter>
          <Button type="submit" form="add-agency-form" disabled={mutation.isLoading}>
            {mutation.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Agency"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}