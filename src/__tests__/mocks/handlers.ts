/**
 * MSW (Mock Service Worker) Handlers for Integration Tests
 * 
 * These handlers mock the backend API responses for testing
 * the mobile app's integration with the backend.
 */

import { rest } from 'msw';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// ==================== Mock Data ====================

export const mockBankAccounts = [
    {
        id: 'bank-1',
        accountNumber: '****1234',
        accountHolderName: 'Test User',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0001234',
        verified: true,
        isPrimary: true,
        createdAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'bank-2',
        accountNumber: '****5678',
        accountHolderName: 'Test User',
        bankName: 'SBI Bank',
        ifscCode: 'SBIN0001234',
        verified: false,
        isPrimary: false,
        createdAt: '2024-01-02T00:00:00Z',
    },
];

export const mockWallet = {
    id: 'wallet-1',
    balance: 50000,
    availableBalance: 45000,
    pendingBalance: 5000,
    currency: 'INR',
};

export const mockKYCDocuments = [
    {
        id: 'kyc-1',
        userId: 'user-1',
        documentType: 'AADHAAR',
        documentUrl: 'https://storage.example.com/kyc/aadhaar.jpg',
        status: 'APPROVED',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
    },
];

export const mockKYCStatus = {
    documents: mockKYCDocuments,
    isVerified: false,
    totalSubmitted: 1,
    totalApproved: 1,
    totalRejected: 0,
    totalPending: 0,
};

export const mockUserProfile = {
    id: 'user-1',
    userId: 'user-1',
    fullName: 'Test Creator',
    bio: 'Test bio',
    location: 'Mumbai',
    email: 'test@example.com',
    phone: '+91 9876543210',
    avatarUrl: 'https://storage.example.com/avatars/user-1.jpg',
};

// ==================== Handlers ====================

export const handlers = [
    // ==================== KYC Endpoints ====================

    // GET /kyc/status
    rest.get(`${API_BASE_URL}/kyc/status`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockKYCStatus));
    }),

    // POST /kyc/submit
    rest.post(`${API_BASE_URL}/kyc/submit`, async (req, res, ctx) => {
        // Simulate multipart form data handling
        const formData = await req.formData?.();
        const documentType = formData?.get('documentType');
        const documentNumber = formData?.get('documentNumber');
        const file = formData?.get('file');

        if (!documentType || !file) {
            return res(
                ctx.status(400),
                ctx.json({ message: 'documentType and file are required' })
            );
        }

        const newDocument = {
            id: `kyc-${Date.now()}`,
            userId: 'user-1',
            documentType: documentType as string,
            documentNumber: documentNumber as string,
            documentUrl: `https://storage.example.com/kyc/${documentType}.jpg`,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return res(ctx.status(201), ctx.json(newDocument));
    }),

    // ==================== Wallet Endpoints ====================

    // GET /wallet
    rest.get(`${API_BASE_URL}/wallet`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockWallet));
    }),

    // GET /wallet/bank-accounts
    rest.get(`${API_BASE_URL}/wallet/bank-accounts`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockBankAccounts));
    }),

    // POST /wallet/bank-accounts
    rest.post(`${API_BASE_URL}/wallet/bank-accounts`, async (req, res, ctx) => {
        const body = await req.json();

        if (!body.accountNumber || !body.ifscCode || !body.accountHolderName) {
            return res(
                ctx.status(400),
                ctx.json({ message: 'Missing required fields' })
            );
        }

        const newBankAccount = {
            id: `bank-${Date.now()}`,
            accountNumber: `****${body.accountNumber.slice(-4)}`,
            accountHolderName: body.accountHolderName,
            bankName: 'Test Bank',
            ifscCode: body.ifscCode,
            verified: false,
            isPrimary: false,
            createdAt: new Date().toISOString(),
        };

        return res(ctx.status(201), ctx.json(newBankAccount));
    }),

    // POST /wallet/withdraw
    rest.post(`${API_BASE_URL}/wallet/withdraw`, async (req, res, ctx) => {
        const body = await req.json();
        const idempotencyKey = req.headers.get('Idempotency-Key');

        if (!body.amount || !body.bankAccountId) {
            return res(
                ctx.status(400),
                ctx.json({ message: 'amount and bankAccountId are required' })
            );
        }

        if (body.amount < 100) {
            return res(
                ctx.status(422),
                ctx.json({ message: 'Minimum withdrawal is ₹100' })
            );
        }

        if (body.amount > mockWallet.availableBalance) {
            return res(
                ctx.status(422),
                ctx.json({ message: 'Insufficient balance' })
            );
        }

        const withdrawalRequest = {
            id: `withdrawal-${Date.now()}`,
            userId: 'user-1',
            amount: body.amount,
            currency: 'INR',
            bankAccountId: body.bankAccountId,
            status: 'PENDING',
            idempotencyKey,
            createdAt: new Date().toISOString(),
        };

        // Update mock wallet balance
        mockWallet.availableBalance -= body.amount;
        mockWallet.pendingBalance += body.amount;

        return res(ctx.status(201), ctx.json(withdrawalRequest));
    }),

    // GET /wallet/withdrawals
    rest.get(`${API_BASE_URL}/wallet/withdrawals`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                content: [],
                page: 0,
                size: 20,
                totalElements: 0,
                totalPages: 0,
                last: true,
            })
        );
    }),

    // ==================== Profile Endpoints ====================

    // GET /profile
    rest.get(`${API_BASE_URL}/profile`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockUserProfile));
    }),

    // PUT /profile
    rest.put(`${API_BASE_URL}/profile`, async (req, res, ctx) => {
        const body = await req.json();

        const updatedProfile = {
            ...mockUserProfile,
            ...body,
            updatedAt: new Date().toISOString(),
        };

        // Update mock for subsequent calls
        Object.assign(mockUserProfile, updatedProfile);

        return res(ctx.status(200), ctx.json(updatedProfile));
    }),

    // POST /profile/avatar
    rest.post(`${API_BASE_URL}/profile/avatar`, async (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                avatarUrl: `https://storage.example.com/avatars/user-1-${Date.now()}.jpg`,
            })
        );
    }),

    // ==================== Deliverable Endpoints ====================

    // POST /deliverables
    rest.post(`${API_BASE_URL}/deliverables`, async (req, res, ctx) => {
        const formData = await req.formData?.();
        const applicationId = formData?.get('applicationId');
        const campaignDeliverableId = formData?.get('campaignDeliverableId');
        const file = formData?.get('file');

        if (!applicationId || !campaignDeliverableId || !file) {
            return res(
                ctx.status(400),
                ctx.json({ message: 'Missing required fields' })
            );
        }

        const submission = {
            id: `submission-${Date.now()}`,
            applicationId,
            campaignDeliverableId,
            fileUrl: `https://storage.example.com/deliverables/${Date.now()}.mp4`,
            status: 'PENDING_REVIEW',
            createdAt: new Date().toISOString(),
        };

        return res(ctx.status(201), ctx.json(submission));
    }),
];

// ==================== Error Handlers ====================

export const errorHandlers = {
    kycSubmitError: rest.post(`${API_BASE_URL}/kyc/submit`, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
    }),

    withdrawalError: rest.post(`${API_BASE_URL}/wallet/withdraw`, (req, res, ctx) => {
        return res(ctx.status(403), ctx.json({ message: 'KYC not verified' }));
    }),

    profileUpdateError: rest.put(`${API_BASE_URL}/profile`, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Failed to update profile' }));
    }),

    networkError: rest.get(`${API_BASE_URL}/wallet`, (req, res) => {
        return res.networkError('Failed to connect');
    }),
};
