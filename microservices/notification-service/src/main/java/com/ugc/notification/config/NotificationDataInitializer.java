package com.ugc.notification.config;

import com.ugc.notification.entity.NotificationEntity;
import com.ugc.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificationDataInitializer implements CommandLineRunner {

    private final NotificationRepository notificationRepository;

    @Override
    public void run(String... args) {
        if (notificationRepository.count() == 0) {
            List<NotificationEntity> list = List.of(
                NotificationEntity.builder().id("n1_inst").role("INSTITUTION").title("Document verification passed").description("Annexure IV (Faculty List) cleared NLP cross-check.").tone("emerald").timeAgo("12m ago").unread(true).createdAt(LocalDateTime.now()).build(),
                NotificationEntity.builder().id("n2_inst").role("INSTITUTION").title("Action required on Annexure VII").description("Land ownership document needs a clearer scan — resubmit.").tone("amber").timeAgo("1h ago").unread(true).createdAt(LocalDateTime.now()).build(),
                NotificationEntity.builder().id("n1_ugc").role("UGC").title("Critical anomaly flagged").description("Coastal Business School — faculty shortfall of 36.7% detected.").tone("red").timeAgo("8m ago").unread(true).createdAt(LocalDateTime.now()).build()
            );
            notificationRepository.saveAll(list);
        }
    }
}
