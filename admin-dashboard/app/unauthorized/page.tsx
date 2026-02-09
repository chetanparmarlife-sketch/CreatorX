/**
 * Unauthorized Access Page
 * 
 * Shown when a non-admin user tries to access the admin dashboard.
 * Provides options to:
 * - Go to Brand Dashboard (if role is BRAND)
 * - Login with different account
 * - Contact support
 */

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function UnauthorizedContent() {
    const searchParams = useSearchParams()
    const role = searchParams.get('role')

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <svg
                        className="w-10 h-10 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-white mb-2">
                    Admin Access Required
                </h1>

                {/* Description */}
                <p className="text-gray-400 mb-6">
                    This dashboard is restricted to administrators only.
                    {role && (
                        <span className="block mt-2">
                            Your current role is: <strong className="text-yellow-400">{role}</strong>
                        </span>
                    )}
                </p>

                {/* Actions */}
                <div className="space-y-3">
                    {/* Go to Brand Dashboard if user is BRAND */}
                    {role === 'BRAND' && (
                        <a
                            href={process.env.NEXT_PUBLIC_BRAND_DASHBOARD_URL || 'http://localhost:3000'}
                            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Go to Brand Dashboard
                        </a>
                    )}

                    {/* Login with different account */}
                    <Link
                        href="/login"
                        className="block w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                    >
                        Login with Admin Account
                    </Link>

                    {/* Contact support */}
                    <p className="text-sm text-gray-500 mt-4">
                        Need admin access?{' '}
                        <a
                            href="mailto:admin@creatorx.com"
                            className="text-blue-400 hover:text-blue-300"
                        >
                            Contact support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function UnauthorizedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        }>
            <UnauthorizedContent />
        </Suspense>
    )
}
