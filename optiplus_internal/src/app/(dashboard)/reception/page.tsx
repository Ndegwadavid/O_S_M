import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import RegistrationForm from "@/components/client/RegistrationForm";

export default async function ReceptionPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/staff-login");
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Reception Dashboard</h1>
      <RegistrationForm />
    </div>
  );
}