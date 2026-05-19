package com.inventory.inventory_management.controller;

import com.inventory.inventory_management.entity.Notification;
import com.inventory.inventory_management.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // Track active Server-Sent Event (SSE) connections by User Email
    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @GetMapping("/stream")
    public SseEmitter streamNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Timeout set to 30 minutes to match Render constraints
        SseEmitter emitter = new SseEmitter(1800000L);
        emitters.computeIfAbsent(email, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(email, emitter));
        emitter.onTimeout(() -> removeEmitter(email, emitter));
        emitter.onError((e) -> removeEmitter(email, emitter));

        // Send initial connection event
        try {
            emitter.send(SseEmitter.event().name("CONNECT").data("SSE Connection Established"));
        } catch (Exception e) {
            removeEmitter(email, emitter);
        }

        return emitter;
    }

    private void removeEmitter(String email, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(email);
        if (userEmitters != null) {
            userEmitters.remove(emitter);
        }
    }

    // Public method to broadcast new notifications to a specific user
    public void pushNotification(Notification notification) {
        notificationRepository.save(notification);
        List<SseEmitter> userEmitters = emitters.get(notification.getUserEmail());
        if (userEmitters != null) {
            for (SseEmitter emitter : userEmitters) {
                try {
                    emitter.send(SseEmitter.event().name("NOTIFICATION").data(notification));
                } catch (Exception e) {
                    emitter.complete();
                    removeEmitter(notification.getUserEmail(), emitter);
                }
            }
        }
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/read")
    public ResponseEntity<?> markAllAsRead() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        for (Notification n : notifications) {
            n.setRead(true);
        }
        notificationRepository.saveAll(notifications);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUserEmail().equals(email)) {
                notificationRepository.delete(n);
            }
        });
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted");
        return ResponseEntity.ok(response);
    }
}
