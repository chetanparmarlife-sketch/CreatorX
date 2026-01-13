/**
 * Supabase Phone Auth Service
 * Replaces the mock OTP service with real Supabase phone auth
 */

import { getSupabaseClient } from '@/src/lib/supabase';

export interface SendOTPResult {
    success: boolean;
    message: string;
}

export interface VerifyOTPResult {
    success: boolean;
    message: string;
    isNewUser?: boolean;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
}

/**
 * Format phone number for Supabase (E.164 format)
 */
function formatPhoneForSupabase(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    // Assuming Indian phone numbers (+91)
    if (cleaned.length === 10) {
        return `+91${cleaned}`;
    }
    // If already has country code
    if (cleaned.length > 10) {
        return `+${cleaned}`;
    }
    return `+91${cleaned}`;
}

/**
 * Send OTP to phone number using Supabase
 */
export async function sendOTP(phoneNumber: string): Promise<SendOTPResult> {
    try {
        if (!phoneNumber || phoneNumber.length < 10) {
            return {
                success: false,
                message: 'Please enter a valid phone number',
            };
        }

        const supabase = getSupabaseClient();
        const formattedPhone = formatPhoneForSupabase(phoneNumber);

        const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
        });

        if (error) {
            console.error('Supabase OTP error:', error);
            return {
                success: false,
                message: error.message || 'Failed to send OTP. Please try again.',
            };
        }

        return {
            success: true,
            message: 'OTP sent successfully. Please check your phone.',
        };
    } catch (err) {
        console.error('Send OTP error:', err);
        return {
            success: false,
            message: 'Failed to send OTP. Please try again.',
        };
    }
}

/**
 * Verify OTP using Supabase
 */
export async function verifyOTP(
    phoneNumber: string,
    otp: string
): Promise<VerifyOTPResult> {
    try {
        const supabase = getSupabaseClient();
        const formattedPhone = formatPhoneForSupabase(phoneNumber);

        const { data, error } = await supabase.auth.verifyOtp({
            phone: formattedPhone,
            token: otp,
            type: 'sms',
        });

        if (error) {
            console.error('Supabase verify OTP error:', error);
            return {
                success: false,
                message: error.message || 'Invalid OTP. Please try again.',
            };
        }

        if (!data.session) {
            return {
                success: false,
                message: 'Verification failed. Please try again.',
            };
        }

        // Check if this is a new user (no user metadata set yet)
        const isNewUser = !data.user?.user_metadata?.full_name;

        return {
            success: true,
            message: 'Phone verified successfully',
            isNewUser,
        };
    } catch (err) {
        console.error('Verify OTP error:', err);
        return {
            success: false,
            message: 'Failed to verify OTP. Please try again.',
        };
    }
}
