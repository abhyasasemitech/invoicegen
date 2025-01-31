import {z} from 'zod'
export const onboardingSchema = z.object({
    firstName: z.string().min(1,"First name is requried"),
    lastName: z.string().min(2,"Last name is required"),
    address:z.string().min(2,"Address is required"),
    
})