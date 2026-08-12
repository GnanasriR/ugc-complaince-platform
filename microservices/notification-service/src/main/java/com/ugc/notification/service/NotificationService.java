package com.ugc.notification.service;

import com.ugc.notification.entity.NotificationEntity;
import com.ugc.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationEntity> getNotificationsByRole(String role) {
        return notificationRepository.findByRoleOrderByCreatedAtDesc(role.toUpperCase());
    }

    public NotificationEntity markAsRead(String id) {
        NotificationEntity notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
        notification.setUnread(false);
        return notificationRepository.save(notification);
    }
}
