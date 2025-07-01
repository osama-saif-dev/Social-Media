import { z } from 'zod';

export const profileSchema = z.object({
    name: z.string({
        invalid_type_error: 'Field must be string',
        required_error: 'Name is required'
    })
        .min(1, { message: 'Name is required' })
        .trim(),

    bio: z.string({
        invalid_type_error: 'Field must be string',
    })
        .trim(),

})
