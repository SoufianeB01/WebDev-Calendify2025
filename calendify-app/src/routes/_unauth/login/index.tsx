import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useAppForm } from '@/hooks/demo.form'

export const Route = createFileRoute('/_unauth/login/')({
    component: SimpleForm,
    validateSearch: z.object({
        redirectPath: z.string().optional(),
    }),
})

const schema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
})

function SimpleForm() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    const form = useAppForm({
        defaultValues: {
            username: '',
            password: '',
        },
        validators: {
            onBlur: schema,
        },
        onSubmit: ({ value }) => {
            console.log(value)
            // Show success message
            alert('Login successful!')
            localStorage.setItem('isAuthenticated', 'true')

            if (search.redirectPath) {
                navigate({ to: search.redirectPath })
            } else {
                navigate({ to: '/' })
            }
        },
    })

    return (
        <div
            className="flex items-center justify-center min-h-screen p-4 text-white"
        >
            <div className="w-full max-w-md p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
                <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-6"
                >
                    <form.AppField name="username">
                        {(field) => <field.TextField label="Username" />}
                    </form.AppField>

                    <form.AppField name="password">
                        {(field) => <field.TextField label="Password" type="password" />}
                    </form.AppField>

                    <div className="flex justify-center">
                        <form.AppForm>
                            <form.SubscribeButton label="Login" />
                        </form.AppForm>
                    </div>
                </form>
            </div>
        </div>
    )
}
