import { SignedIn, SignedOut } from "@clerk/nextjs";

import { Layout } from "@/styles/page-layout";

import Home from "./Home";
import Dashboard from "./Dashboard";

function Page() {
  return (
    <div className={`${Layout.center}`}>
			{/* <UserButton />
      <Button variant="outline">click</Button> */}

			{/* Landing (Home) Page Content */}
			<SignedOut>
				<Home />
			</SignedOut>

			{/* Dashboard Page Content */}
			<SignedIn>
				<Dashboard />
			</SignedIn>
    </div>
  );
}

export default Page;