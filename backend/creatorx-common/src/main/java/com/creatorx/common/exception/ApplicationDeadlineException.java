package com.creatorx.common.exception;

public class ApplicationDeadlineException extends BusinessException {
    public ApplicationDeadlineException(String message) {
        super(message, "APPLICATION_DEADLINE_EXPIRED");
    }
}

