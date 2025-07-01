import { z } from 'zod';

export const forgetPasswordSchema = z.object({
    email: z.string({
        invalid_type_error: 'Field must be email',
        required_error: 'Email is required'
    })
        .toLowerCase()
        .trim()
        .refine((email) => {
            const allwoedOrigin = ['.com', '.net', '.org', '.edu'];
            return allwoedOrigin.some((origin) => email.endsWith(origin))
        }, {
            message: 'Email must end with .com, .net, .org, or .edu'
        }),
});