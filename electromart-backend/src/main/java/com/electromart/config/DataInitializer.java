// package com.electromart.config;

// import com.electromart.entity.Role;
// import com.electromart.entity.User;
// import com.electromart.repository.UserRepository;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;

// /**
// * Seeds a default ROLE_ADMIN account on startup if one doesn't already exist,
// * so you have a way to log in and hit /admin/** endpoints without touching
// the DB by hand.
// * Change ADMIN_PASSWORD via env var before deploying to production, and
// consider
// * removing/disabling this class once real admin accounts are set up.
// */
// @Component
// @RequiredArgsConstructor
// @Slf4j
// public class DataInitializer implements CommandLineRunner {

// private final UserRepository userRepository;
// private final PasswordEncoder passwordEncoder;

// @Value("${app.admin.seed-email}")
// private String adminEmail;

// @Value("${app.admin.seed-password}")
// private String adminPassword;

// @Value("${app.admin.seed-name}")
// private String adminName;

// @Override
// public void run(String... args) {
// if (userRepository.existsByEmail(adminEmail)) {
// return;
// }

// User admin = User.builder()
// .fullName(adminName)
// .email(adminEmail)
// .phone("9999999999")
// .password(passwordEncoder.encode(adminPassword))
// .role(Role.ROLE_ADMIN)
// .emailVerified(true)
// .enabled(true)
// .build();

// userRepository.save(admin);
// log.info("Seeded default admin account -> email: {} | CHANGE THIS PASSWORD IN
// PRODUCTION", adminEmail);
// }
// }
