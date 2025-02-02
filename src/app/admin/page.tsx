import { getRole } from "@/utils/roles";

export default async function AdminDashboard() {
	const userRole = await getRole()
	
	console.log(userRole)
	
  return (
    <p>
      This is the protected admin dashboard restricted to users with the `admin`
      role. You're role is : {userRole}
    </p>
  );
}
