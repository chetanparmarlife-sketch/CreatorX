package com.creatorx.common.exception;

public class DuplicateApplicationException extends BusinessException {
    public DuplicateApplicationException(String message) {
        super(message, "DUPLICATE_APPLICATION");
    }
}

