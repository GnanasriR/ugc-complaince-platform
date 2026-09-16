package com.ugc.auth.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public boolean sendApprovalConfirmationEmail(String recipientEmail, String fullName, String institutionName) {
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            log.warn("Cannot send approval email: recipient email address is empty.");
            return false;
        }

        String target = recipientEmail.trim();
        log.info("Initiating approval confirmation email dispatch to recipient: {}", target);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String senderEmail = "rgnanasri23@gmail.com";
            helper.setFrom(senderEmail, "UGC Regulatory Portal");
            helper.setReplyTo(senderEmail, "UGC Compliance Cell");
            helper.setTo(target);
            helper.setSubject("UGC Compliance Portal — Registration Request Approved");

            String plainText = "Dear " + (fullName != null ? fullName : "Applicant") + ",\n\n"
                    + "Your registration request for " + (institutionName != null ? institutionName : "Higher Education Institute")
                    + " has been ACCEPTED & APPROVED by the UGC System Administrator.\n\n"
                    + "Status: ACTIVE - Access Granted\n"
                    + "You may now log in to the UGC Compliance Portal using your registered email and password.\n\n"
                    + "University Grants Commission, Ministry of Education, New Delhi, India";

            String bodyHtml = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                </head>
                <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9; color: #1e293b;">
                    <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0;">
                        <div style="background: #061A33; padding: 15px 20px; border-radius: 8px; text-align: center; color: white;">
                            <h2 style="margin: 0; font-size: 18px;">Government of India · UGC / AICTE Portal</h2>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">Official Compliance & Recognition System</p>
                        </div>
                        <div style="padding: 25px 0; text-align: center;">
                            <h3 style="color: #061A33; margin-bottom: 10px;">Registration Approved</h3>
                            <p style="font-size: 14px; color: #475569;">Dear <strong>%s</strong> (%s),</p>
                            <p style="font-size: 14px; color: #475569;">Your registration request for the UGC Compliance Portal has been <strong>ACCEPTED & APPROVED</strong> by the System Administrator.</p>
                            <div style="font-size: 18px; font-weight: bold; color: #059669; background: #ecfdf5; padding: 15px 25px; display: inline-block; border-radius: 10px; border: 1px solid #a7f3d0; margin: 15px 0;">
                                Status: ACTIVE · Access Granted
                            </div>
                            <p style="font-size: 13px; color: #64748b; margin-top: 15px;">You may now log in to the portal using your registered email address and password.</p>
                        </div>
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
                            University Grants Commission · Ministry of Education · New Delhi, India
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(fullName != null ? fullName : "Applicant", institutionName != null ? institutionName : "Higher Education Institute");

            helper.setText(plainText, bodyHtml);

            message.addHeader("X-Priority", "1");
            message.addHeader("X-MSMail-Priority", "High");
            message.addHeader("Importance", "High");

            mailSender.send(message);
            log.info("✅ Physical approval email successfully dispatched via JavaMailSender to {}", target);
            return true;
        } catch (Exception e) {
            log.error("❌ Failed to send approval email via JavaMailSender to {}: {}", target, e.getMessage(), e);
            return false;
        }
    }
}
