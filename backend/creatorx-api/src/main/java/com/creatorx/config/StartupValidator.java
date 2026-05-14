package com.creatorx.config;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * StartupValidator
 *
 * Checks that all required environment variables are set when the
 * backend starts up. If any are missing, the app fails immediately
 * with a clear error message instead of crashing mysteriously later.
 *
 * This saves hours of debugging in production.
 */
@Component
public class StartupValidator implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(StartupValidator.class);

  @Value("${jwt.secret:}")
  private String jwtSecret;

  @Value("${supabase.url:}")
  private String supabaseUrl;

  @Value("${razorpay.key-id:}")
  private String razorpayKeyId;

  @Override
  public void run(ApplicationArguments args) {
    List<String> missing = new ArrayList<>();
    if (jwtSecret.isBlank()) {
      missing.add("JWT_SECRET");
    }
    if (supabaseUrl.isBlank()) {
      missing.add("SUPABASE_URL (STAGING_ or PROD_ prefixed)");
    }
    if (razorpayKeyId.isBlank()) {
      log.warn("RAZORPAY_KEY_ID is not set - payment/payout features will be disabled.");
    }

    if (!missing.isEmpty()) {
      log.error("=================================================");
      log.error("STARTUP FAILED - Missing required environment variables:");
      missing.forEach(v -> log.error("  - {}", v));
      log.error("Set these in Railway environment variables and redeploy.");
      log.error("=================================================");
      throw new IllegalStateException("Missing required environment variables: " + missing);
    }
    log.info("Startup validation passed - all required environment variables are set.");
  }
}
