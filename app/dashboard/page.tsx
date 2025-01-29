import { requrireUser } from "../utils/hook";


const  page = async () => {
   const session = await requrireUser();
  return (
    <div>
      <h1>Hello from the dashboard route</h1>
    </div>
  )
}

export default page
