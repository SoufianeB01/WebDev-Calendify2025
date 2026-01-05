import React, { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143'

type User = any

interface AuthContextValue {
    user: User | null
    isLoading: boolean
    isAdmin: boolean
    refetch: () => void
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    isLoading: true,
    isAdmin: false,
    refetch: () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data, isLoading, refetch } = useQuery<User | null>({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            try {
                const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
                if (!res.ok) return null
                return (await res.json())
            } catch (err) {
                return null
            }
        },
        staleTime: 1000 * 60 * 5,
    })

    const roleVal = (data && (data.role ?? data.Role)) || ''
    const isAdmin = typeof roleVal === 'string' && roleVal.toLowerCase() === 'admin'

    return (
        <AuthContext.Provider value={{ user: data ?? null, isLoading, isAdmin, refetch }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
