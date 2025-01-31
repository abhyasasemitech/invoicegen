import { Button } from "@/components/ui/button";
import { signOut } from "../utils/auth";
import { requireUser } from "../utils/hook";


const  page = async () => {
   const session = await requireUser();
  return (
    <div>
      <h1>Hello from the dashboard route</h1>
      <form action={async () => {
        "use server";
        await signOut();
      }}>
        <Button type="submit">Sign Out</Button>
      </form>
    </div>
  )
}

export default page
