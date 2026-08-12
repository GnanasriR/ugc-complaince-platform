package com.ugc.notification.controller;

import com.ugc.notification.entity.NotificationEntity;
import com.ugc.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationEntity>> getNotifications(@RequestParam(name = "role", defaultValue = "INSTITUTION") String role) {
        return ResponseEntity.ok(notificationService.getNotificationsByRole(role));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationEntity> markAsRead(@PathVariable("id") String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }
}
