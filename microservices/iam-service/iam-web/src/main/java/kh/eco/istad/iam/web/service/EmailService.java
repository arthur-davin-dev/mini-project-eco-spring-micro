package kh.eco.istad.iam.web.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${iam.mail.from:}")
    private String mailFrom;

    @Value("${iam.mail.sender-name:ISTAD Identity}")
    private String senderName;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private Map<String, String> readDotEnv() {
        Map<String, String> map = new HashMap<>();
        List<Path> candidates = List.of(
                Paths.get(".env"),
                Paths.get(".env.properties"),
                Paths.get("../.env"),
                Paths.get("../../.env"),
                Paths.get("../../../.env")
        );
        for (Path path : candidates) {
            if (Files.isRegularFile(path)) {
                try (var lines = Files.lines(path)) {
                    lines.map(String::trim)
                            .filter(l -> !l.isEmpty() && !l.startsWith("#") && l.contains("="))
                            .forEach(l -> {
                                int idx = l.indexOf('=');
                                String k = l.substring(0, idx).trim();
                                String v = l.substring(idx + 1).trim();
                                map.putIfAbsent(k, v);
                            });
                } catch (Exception ignored) {}
            }
        }
        return map;
    }

    /**
     * Sends a modern HTML password reset verification email.
     *
     * @param recipientEmail    Recipient's email address
     * @param username          Username
     * @param code              6-digit verification code
     * @param expirationMinutes Minutes before code expiration
     * @return true if email was successfully dispatched via SMTP; false otherwise
     */
    public boolean sendPasswordResetCode(String recipientEmail, String username, String code, int expirationMinutes) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Cannot send password reset email: recipient email is blank for user '{}'", username);
            return false;
        }

        String effectiveUsername = (mailUsername != null && !mailUsername.isBlank())
                ? mailUsername : System.getenv("SPRING_MAIL_USERNAME");
        String effectivePassword = (mailPassword != null && !mailPassword.isBlank())
                ? mailPassword : System.getenv("SPRING_MAIL_PASSWORD");
        String effectiveFrom = (mailFrom != null && !mailFrom.isBlank())
                ? mailFrom : ((effectiveUsername != null && !effectiveUsername.isBlank()) ? effectiveUsername : System.getenv("SPRING_MAIL_FROM"));

        if (effectiveUsername == null || effectiveUsername.isBlank() || effectivePassword == null || effectivePassword.isBlank()) {
            Map<String, String> dotEnv = readDotEnv();
            if (effectiveUsername == null || effectiveUsername.isBlank()) {
                effectiveUsername = dotEnv.get("SPRING_MAIL_USERNAME");
            }
            if (effectivePassword == null || effectivePassword.isBlank()) {
                effectivePassword = dotEnv.get("SPRING_MAIL_PASSWORD");
            }
            if (effectiveFrom == null || effectiveFrom.isBlank()) {
                effectiveFrom = dotEnv.getOrDefault("SPRING_MAIL_FROM", effectiveUsername);
            }
        }

        if (effectiveUsername == null || effectiveUsername.isBlank() || effectivePassword == null || effectivePassword.isBlank()) {
            log.warn("================================================================================");
            log.warn("[EMAIL NOTICE] SMTP credentials not set (SPRING_MAIL_USERNAME / SPRING_MAIL_PASSWORD).");
            log.warn("Recipient: {}", recipientEmail);
            log.warn("User: {}", username);
            log.warn("Password Reset Code: {}", code);
            log.warn("Expires in: {} minutes", expirationMinutes);
            log.warn("Configure SPRING_MAIL_USERNAME and SPRING_MAIL_PASSWORD in .env for live email delivery.");
            log.warn("================================================================================");
            return false;
        }

        try {
            JavaMailSender activeSender = this.mailSender;
            if (activeSender == null) {
                JavaMailSenderImpl dynamicSender = new JavaMailSenderImpl();
                dynamicSender.setHost("smtp.gmail.com");
                dynamicSender.setPort(587);
                dynamicSender.setDefaultEncoding("UTF-8");
                Properties props = dynamicSender.getJavaMailProperties();
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.smtp.starttls.required", "true");
                props.put("mail.smtp.ssl.trust", "*");
                props.put("mail.smtp.connectiontimeout", "10000");
                props.put("mail.smtp.timeout", "10000");
                props.put("mail.smtp.writetimeout", "10000");
                activeSender = dynamicSender;
            }

            if (activeSender instanceof JavaMailSenderImpl impl) {
                impl.setUsername(effectiveUsername.trim());
                impl.setPassword(effectivePassword.trim().replace(" ", ""));
            }

            MimeMessage message = activeSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            helper.setFrom(effectiveFrom != null ? effectiveFrom.trim() : effectiveUsername.trim(), senderName);
            helper.setTo(recipientEmail);
            helper.setSubject("Reset your ISTAD Identity password - " + code);

            String htmlBody = buildPasswordResetHtml(username, code, expirationMinutes);
            helper.setText(htmlBody, true);

            log.info("Sending password reset email to '{}' via SMTP ({}:{} as '{}')...", recipientEmail, "smtp.gmail.com", 587, effectiveUsername);
            activeSender.send(message);
            log.info("Password reset verification email successfully sent to '{}' for user '{}'", recipientEmail, username);
            return true;
        } catch (Exception ex) {
            log.error("Failed to send password reset email to '{}' via SMTP: {}", recipientEmail, ex.getMessage(), ex);
            return false;
        }
    }

    private String buildPasswordResetHtml(String username, String code, int expirationMinutes) {
        String template = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset your ISTAD Identity password</title>
              <style>
                body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; }
                .wrapper { width: 100%; max-width: 560px; margin: 40px auto; background-color: #111827; border-radius: 16px; border: 1px solid #1f2937; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 36px; text-align: center; }
                .logo-title { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
                .logo-sub { font-size: 13px; color: #e0e7ff; margin-top: 4px; font-weight: 500; }
                .body-content { padding: 36px; }
                .greeting { font-size: 16px; font-weight: 600; color: #f8fafc; margin-bottom: 12px; }
                .desc { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
                .code-box { background-color: #1e1b4b; border: 2px dashed #6366f1; border-radius: 12px; padding: 22px; text-align: center; margin-bottom: 24px; }
                .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #a5b4fc; font-weight: 600; margin-bottom: 8px; }
                .code-digits { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; }
                .info-pill { background-color: #1f2937; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #cbd5e1; margin-bottom: 24px; border-left: 3px solid #7c3aed; }
                .footer { background-color: #0f172a; padding: 24px 36px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="header">
                  <h1 class="logo-title">ISTAD Identity</h1>
                  <div class="logo-sub">Security &amp; Account Protection</div>
                </div>
                <div class="body-content">
                  <div class="greeting">Hello {{USERNAME}},</div>
                  <p class="desc">
                    We received a request to reset the password for your ISTAD Identity account.
                    Please enter the verification code below on the reset page:
                  </p>
                  <div class="code-box">
                    <div class="code-label">Verification Code</div>
                    <div class="code-digits">{{CODE}}</div>
                  </div>
                  <div class="info-pill">
                    &#9201; This code expires in <strong>{{EXPIRATION}} minutes</strong>.
                  </div>
                  <p class="desc" style="font-size: 13px; color: #64748b; margin-bottom: 0;">
                    If you did not request a password reset, no further action is required and your account remains safe.
                  </p>
                </div>
                <div class="footer">
                  This is an automated security message from ISTAD Identity Service.<br>
                  &copy; ISTAD Identity &amp; Access Management.
                </div>
              </div>
            </body>
            </html>
            """;

        return template
                .replace("{{USERNAME}}", username != null ? username : "")
                .replace("{{CODE}}", code)
                .replace("{{EXPIRATION}}", String.valueOf(expirationMinutes));
    }
}
