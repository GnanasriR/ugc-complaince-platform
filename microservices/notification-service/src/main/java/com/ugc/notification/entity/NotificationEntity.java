package com.ugc.notification.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEntity {

    @Id
    private String id;

    private String role; // INSTITUTION or UGC

    private String title;

    private String description;

    private String tone;

    private String timeAgo;

    private Boolean unread;

    private LocalDateTime createdAt;
}
