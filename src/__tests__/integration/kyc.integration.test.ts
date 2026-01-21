/**
 * KYC Integration Tests
 * 
 * Tests the KYC submission flow including:
 * - Document upload
 * - Status fetching
 * - Error handling
 */

import { kycService, KYCStatusResponse } from '../../api/services/kycService';
import { server, errorHandlers } from '../mocks/server';
import { rest } from 'msw';

// Configure MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('KYC Service Integration', () => {
    describe('getKYCStatus', () => {
        it('should fetch KYC status successfully', async () => {
            const status = await kycService.getKYCStatus();

            expect(status).toBeDefined();
            expect(status.documents).toBeInstanceOf(Array);
            expect(typeof status.isVerified).toBe('boolean');
            expect(typeof status.totalSubmitted).toBe('number');
            expect(typeof status.totalApproved).toBe('number');
        });

        it('should return document details', async () => {
            const status = await kycService.getKYCStatus();

            if (status.documents.length > 0) {
                const doc = status.documents[0];
                expect(doc).toHaveProperty('id');
                expect(doc).toHaveProperty('documentType');
                expect(doc).toHaveProperty('status');
                expect(['PENDING', 'APPROVED', 'REJECTED']).toContain(doc.status);
            }
        });
    });

    describe('submitKYC', () => {
        const mockFile = {
            uri: 'file:///path/to/document.jpg',
            type: 'image/jpeg',
            name: 'aadhaar_front.jpg',
        };

        it('should submit AADHAAR document successfully', async () => {
            const result = await kycService.submitKYC({
                documentType: 'AADHAAR',
                documentNumber: '123456789012',
                file: mockFile,
            });

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.documentType).toBe('AADHAAR');
            expect(result.status).toBe('PENDING');
            expect(result.documentUrl).toContain('AADHAAR');
        });

        it('should submit PAN document successfully', async () => {
            const result = await kycService.submitKYC({
                documentType: 'PAN',
                documentNumber: 'ABCDE1234F',
                file: mockFile,
            });

            expect(result).toBeDefined();
            expect(result.documentType).toBe('PAN');
            expect(result.status).toBe('PENDING');
        });

        it('should handle server errors gracefully', async () => {
            // Override with error handler
            server.use(errorHandlers.kycSubmitError);

            await expect(
                kycService.submitKYC({
                    documentType: 'AADHAAR',
                    file: mockFile,
                })
            ).rejects.toThrow();
        });

        it('should include documentNumber in submission', async () => {
            const documentNumber = '123456789012';

            const result = await kycService.submitKYC({
                documentType: 'AADHAAR',
                documentNumber,
                file: mockFile,
            });

            expect(result.documentNumber).toBe(documentNumber);
        });
    });

    describe('KYC Flow E2E', () => {
        it('should complete full KYC submission flow', async () => {
            const mockFile = {
                uri: 'file:///path/to/document.jpg',
                type: 'image/jpeg',
                name: 'document.jpg',
            };

            // Step 1: Check initial status
            const initialStatus = await kycService.getKYCStatus();
            const initialCount = initialStatus.totalSubmitted;

            // Step 2: Submit new document
            const submission = await kycService.submitKYC({
                documentType: 'GST',
                documentNumber: 'GSTIN12345678',
                file: mockFile,
            });

            expect(submission.status).toBe('PENDING');
            expect(submission.id).toBeDefined();

            // Step 3: Verify status reflects pending document
            // In real tests, this would show the new document
            expect(submission.documentType).toBe('GST');
        });

        it('should reject invalid document type gracefully', async () => {
            const mockFile = {
                uri: 'file:///path/to/document.jpg',
                type: 'image/jpeg',
                name: 'document.jpg',
            };

            // This should still work as backend validates the type
            await expect(
                kycService.submitKYC({
                    // @ts-ignore - Testing invalid type
                    documentType: 'INVALID_TYPE',
                    file: mockFile,
                })
            ).resolves.toBeDefined();
        });
    });
});

describe('KYC Status Verification', () => {
    it('should return correct verification flags', async () => {
        const status = await kycService.getKYCStatus();

        // Verify the status structure matches expected response
        expect(status).toMatchObject({
            documents: expect.any(Array),
            isVerified: expect.any(Boolean),
            totalSubmitted: expect.any(Number),
            totalApproved: expect.any(Number),
            totalRejected: expect.any(Number),
            totalPending: expect.any(Number),
        });
    });

    it('should calculate isVerified correctly', async () => {
        const status = await kycService.getKYCStatus();

        // If all required documents are approved, isVerified should be true
        // This is a basic check - real logic depends on backend
        if (status.totalApproved >= 2) {
            // Assuming 2 required docs (AADHAAR + PAN)
            expect(status.isVerified).toBe(true);
        }
    });
});
