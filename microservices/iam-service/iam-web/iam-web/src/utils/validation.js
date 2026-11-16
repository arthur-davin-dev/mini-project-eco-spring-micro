import {z} from 'zod'

/**
 * Common Zod validation schemas across IAM forms
 */

export function getRegisterSchema(locale = 'en') {
    const isKm = locale === 'km'
    return z.object({
        username: z
            .string({required_error: isKm ? 'សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់' : 'Username is required'})
            .min(1, isKm ? 'សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់' : 'Username is required')
            .min(3, isKm ? 'ឈ្មោះអ្នកប្រើប្រាស់ត្រូវមានយ៉ាងតិច 3 តួអក្សរ' : 'Username must be at least 3 characters')
            .max(50, isKm ? 'ឈ្មោះអ្នកប្រើប្រាស់មិនអាចលើសពី 50 តួអក្សរទេ' : 'Username cannot exceed 50 characters')
            .regex(/^[a-zA-Z0-9._-]+$/, isKm ? 'ឈ្មោះអ្នកប្រើប្រាស់អាចមានតែអក្សរ លេខ សញ្ញាចុច ដក និង underscore ប៉ុណ្ណោះ' : 'Username can only contain letters, numbers, dots, hyphens, and underscores'),
        email: z
            .string({required_error: isKm ? 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែល' : 'Email address is required'})
            .min(1, isKm ? 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែល' : 'Email address is required')
            .email(isKm ? 'ទម្រង់អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវទេ' : 'Invalid email address format'),
        givenName: z
            .string({required_error: isKm ? 'សូមបញ្ចូលនាមខ្លួន' : 'First name is required'})
            .min(1, isKm ? 'សូមបញ្ចូលនាមខ្លួន' : 'First name is required')
            .max(50, isKm ? 'នាមខ្លួនមិនអាចលើសពី 50 តួអក្សរទេ' : 'First name cannot exceed 50 characters'),
        familyName: z
            .string({required_error: isKm ? 'សូមបញ្ចូលនាមត្រកូល' : 'Last name is required'})
            .min(1, isKm ? 'សូមបញ្ចូលនាមត្រកូល' : 'Last name is required')
            .max(50, isKm ? 'នាមត្រកូលមិនអាចលើសពី 50 តួអក្សរទេ' : 'Last name cannot exceed 50 characters'),
        password: z
            .string({required_error: isKm ? 'សូមបញ្ចូលពាក្យសម្ងាត់' : 'Password is required'})
            .min(1, isKm ? 'សូមបញ្ចូលពាក្យសម្ងាត់' : 'Password is required')
            .min(8, isKm ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 8 តួអក្សរ' : 'Password must be at least 8 characters'),
        confirmPassword: z
            .string({required_error: isKm ? 'សូមបញ្ជាក់ពាក្យសម្ងាត់' : 'Please confirm the password'})
            .min(1, isKm ? 'សូមបញ្ជាក់ពាក្យសម្ងាត់' : 'Please confirm the password'),
        locale: z.string().default('en'),
    }).refine(data => data.password === data.confirmPassword, {
        message: isKm ? 'ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ' : 'The passwords do not match',
        path: ['confirmPassword'],
    })
}

export const createUserSchema = getRegisterSchema('en')

export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
})

export const profileSchema = z.object({
    givenName: z.string().min(1, 'First name is required').max(50),
    familyName: z.string().min(1, 'Last name is required').max(50),
    nickname: z.string().max(50).optional().or(z.literal('')),
    phoneNumber: z.string().max(20).optional().or(z.literal('')),
    pictureUrl: z.string().optional().or(z.literal('')),
    locale: z.string().default('en'),
})

export const createRoleSchema = z.object({
    name: z
        .string()
        .min(2, 'Role name must be at least 2 characters')
        .max(50, 'Role name cannot exceed 50 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Role name can only contain letters, numbers, underscores, and hyphens'),
    description: z.string().max(255).optional().or(z.literal('')),
})

export const createPermissionSchema = z.object({
    resource: z
        .string()
        .min(2, 'Resource is required (at least 2 characters)')
        .max(50)
        .regex(/^[a-zA-Z0-9_-]+$/, 'Resource can only contain letters, numbers, hyphens, and underscores'),
    action: z
        .string()
        .min(2, 'Action is required (e.g. read, write, delete)')
        .max(50)
        .regex(/^[a-zA-Z0-9_*:-]+$/, 'Invalid action format'),
    description: z.string().max(255).optional().or(z.literal('')),
})

export const adminResetPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm the password'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

export const clientSchema = z.object({
    clientId: z.string().min(3, 'Client ID must be at least 3 characters').max(100),
    clientName: z.string().min(2, 'Client Name is required').max(150),
    redirectUris: z.string().min(1, 'At least one Redirect URI is required'),
})

/**
 * Validates data against a Zod schema and returns formatted errors
 */
export function validateForm(schema, data) {
    const result = schema.safeParse(data)
    if (result.success) {
        return {success: true, errors: {}, data: result.data}
    }
    const errors = {}
    for (const issue of result.error.issues) {
        const field = issue.path[0] || 'form'
        if (!errors[field]) {
            errors[field] = issue.message
        }
    }
    const firstErrorMessage = result.error.issues[0]?.message || 'Validation failed'
    return {success: false, errors, firstErrorMessage}
}
