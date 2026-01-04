package com.creatorx.service.security;

import com.creatorx.common.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
@Slf4j
public class TokenEncryptionService {
    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_LENGTH = 12;

    @Value("${creatorx.social.token-secret:}")
    private String tokenSecret;

    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    void validateSecret() {
        if (tokenSecret == null || tokenSecret.isBlank()) {
            log.warn("creatorx.social.token-secret is not configured; social tokens cannot be encrypted");
        }
    }

    public String encrypt(String plaintext) {
        if (plaintext == null) {
            return null;
        }
        SecretKeySpec key = resolveKey();
        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            ByteBuffer buffer = ByteBuffer.allocate(4 + iv.length + ciphertext.length);
            buffer.putInt(iv.length);
            buffer.put(iv);
            buffer.put(ciphertext);
            return Base64.getEncoder().encodeToString(buffer.array());
        } catch (Exception e) {
            throw new BusinessException("Failed to encrypt token", "SOCIAL_TOKEN_ENCRYPT_FAIL");
        }
    }

    public String decrypt(String encoded) {
        if (encoded == null) {
            return null;
        }
        SecretKeySpec key = resolveKey();
        try {
            byte[] payload = Base64.getDecoder().decode(encoded);
            ByteBuffer buffer = ByteBuffer.wrap(payload);
            int ivLength = buffer.getInt();
            if (ivLength < 12 || ivLength > 16) {
                throw new BusinessException("Invalid token payload", "SOCIAL_TOKEN_DECRYPT_FAIL");
            }
            byte[] iv = new byte[ivLength];
            buffer.get(iv);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Failed to decrypt token", "SOCIAL_TOKEN_DECRYPT_FAIL");
        }
    }

    private SecretKeySpec resolveKey() {
        if (tokenSecret == null || tokenSecret.isBlank()) {
            throw new BusinessException("Token encryption secret missing", "SOCIAL_TOKEN_SECRET_MISSING");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(tokenSecret.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new BusinessException("Failed to initialize encryption key", "SOCIAL_TOKEN_KEY_FAIL");
        }
    }
}
