package com.creatorx.common.exception;

public class KYCNotVerifiedException extends BusinessException {
    public KYCNotVerifiedException(String message) {
        super(message, "KYC_NOT_VERIFIED");
    }
}

