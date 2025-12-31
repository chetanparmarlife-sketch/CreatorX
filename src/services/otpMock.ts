const MOCK_DELAY = 1000;
const VALID_OTP = '123456';

export interface SendOTPResult {
  success: boolean;
  message: string;
}

export interface VerifyOTPResult {
  success: boolean;
  message: string;
  isNewUser?: boolean;
}

export async function sendOTP(phoneNumber: string): Promise<SendOTPResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!phoneNumber || phoneNumber.length < 10) {
        resolve({
          success: false,
          message: 'Please enter a valid phone number',
        });
        return;
      }
      resolve({
        success: true,
        message: 'OTP sent successfully. For demo, use: 123456',
      });
    }, MOCK_DELAY);
  });
}

export async function verifyOTP(
  phoneNumber: string,
  otp: string
): Promise<VerifyOTPResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (otp === VALID_OTP) {
        const isNewUser = phoneNumber.endsWith('9999');
        resolve({
          success: true,
          message: 'OTP verified successfully',
          isNewUser,
        });
      } else {
        resolve({
          success: false,
          message: 'Invalid OTP. Please try again.',
        });
      }
    }, MOCK_DELAY);
  });
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}
