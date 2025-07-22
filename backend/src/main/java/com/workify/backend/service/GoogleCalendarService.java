package com.workify.backend.service;

import com.workify.backend.model.Task;
import com.workify.backend.model.OAuthToken;
import com.workify.backend.repository.OAuthTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

@Service
public class GoogleCalendarService {

    @Autowired
    private OAuthTokenRepository oAuthTokenRepository;

    @Autowired
    private RestTemplate restTemplate;

    private static final String CALENDAR_API_URL = "https://www.googleapis.com/calendar/v3";
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    /**
     * Create event in Google Calendar
     */
    public String createCalendarEvent(Task task, String userId) {
        try {
            Optional<OAuthToken> tokenOpt = oAuthTokenRepository.findByUserIdAndProvider(userId, "google");
            if (tokenOpt.isEmpty()) {
                throw new RuntimeException("Google OAuth token not found for user");
            }

            OAuthToken token = tokenOpt.get();
            String accessToken = getValidAccessToken(token);

            Map<String, Object> eventData = createEventData(task);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(eventData, headers);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    CALENDAR_API_URL + "/calendars/primary/events",
                    request,
                    Map.class);

            if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.CREATED) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
                return (String) responseBody.get("id");
            }

            throw new RuntimeException("Failed to create calendar event");

        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Google Calendar API error: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error creating calendar event: " + e.getMessage());
        }
    }

    /**
     * Update event in Google Calendar
     */
    public boolean updateCalendarEvent(Task task, String userId) {
        try {
            if (task.getGoogleCalendarEventId() == null) {
                return false;
            }

            Optional<OAuthToken> tokenOpt = oAuthTokenRepository.findByUserIdAndProvider(userId, "google");
            if (tokenOpt.isEmpty()) {
                throw new RuntimeException("Google OAuth token not found for user");
            }

            OAuthToken token = tokenOpt.get();
            String accessToken = getValidAccessToken(token);

            Map<String, Object> eventData = createEventData(task);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(eventData, headers);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                    CALENDAR_API_URL + "/calendars/primary/events/" + task.getGoogleCalendarEventId(),
                    HttpMethod.PUT,
                    request,
                    Map.class);

            return response.getStatusCode() == HttpStatus.OK;

        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Google Calendar API error: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error updating calendar event: " + e.getMessage());
        }
    }

    /**
     * Delete event from Google Calendar
     */
    public boolean deleteCalendarEvent(String eventId, String userId) {
        try {
            if (eventId == null || eventId.isEmpty()) {
                return false;
            }

            Optional<OAuthToken> tokenOpt = oAuthTokenRepository.findByUserIdAndProvider(userId, "google");
            if (tokenOpt.isEmpty()) {
                throw new RuntimeException("Google OAuth token not found for user");
            }

            OAuthToken token = tokenOpt.get();
            String accessToken = getValidAccessToken(token);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    CALENDAR_API_URL + "/calendars/primary/events/" + eventId,
                    HttpMethod.DELETE,
                    request,
                    String.class);

            return response.getStatusCode() == HttpStatus.NO_CONTENT || response.getStatusCode() == HttpStatus.OK;

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return true; // Event already deleted
            }
            throw new RuntimeException("Google Calendar API error: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error deleting calendar event: " + e.getMessage());
        }
    }

    /**
     * Get event from Google Calendar
     */
    public Map<String, Object> getCalendarEvent(String eventId, String userId) {
        try {
            if (eventId == null || eventId.isEmpty()) {
                return null;
            }

            Optional<OAuthToken> tokenOpt = oAuthTokenRepository.findByUserIdAndProvider(userId, "google");
            if (tokenOpt.isEmpty()) {
                throw new RuntimeException("Google OAuth token not found for user");
            }

            OAuthToken token = tokenOpt.get();
            String accessToken = getValidAccessToken(token);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> request = new HttpEntity<>(headers);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                    CALENDAR_API_URL + "/calendars/primary/events/" + eventId,
                    HttpMethod.GET,
                    request,
                    Map.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
                return responseBody;
            }

            return null;

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null; // Event not found
            }
            throw new RuntimeException("Google Calendar API error: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error getting calendar event: " + e.getMessage());
        }
    }

    /**
     * Create event data for Google Calendar
     */
    private Map<String, Object> createEventData(Task task) {
        Map<String, Object> event = new HashMap<>();

        event.put("summary", "[Workify] " + task.getTitle());

        if (task.getDescription() != null && !task.getDescription().isEmpty()) {
            StringBuilder description = new StringBuilder();
            description.append("Task: ").append(task.getTitle()).append("\n");
            description.append("Description: ").append(task.getDescription()).append("\n");
            description.append("Priority: ").append(task.getPriority()).append("\n");
            description.append("Status: ").append(task.getStatus()).append("\n");

            if (task.getSubTasks() != null && !task.getSubTasks().isEmpty()) {
                description.append("\nSubTasks:\n");
                for (int i = 0; i < task.getSubTasks().size(); i++) {
                    Task.SubTask subTask = task.getSubTasks().get(i);
                    description.append("  ").append(i + 1).append(". ")
                            .append(subTask.getTitle()).append(" (")
                            .append(subTask.getStatus()).append(")\n");
                }
            }

            description.append("\nCreated by Workify Task Manager");
            event.put("description", description.toString());
        }

        // Set event timing
        if (task.getDueDate() != null) {
            Map<String, Object> start = new HashMap<>();
            Map<String, Object> end = new HashMap<>();

            // Set start time 1 hour before due date
            LocalDateTime startTime = task.getDueDate().minusHours(1);
            start.put("dateTime", startTime.format(ISO_FORMATTER));
            start.put("timeZone", "Asia/Ho_Chi_Minh");

            end.put("dateTime", task.getDueDate().format(ISO_FORMATTER));
            end.put("timeZone", "Asia/Ho_Chi_Minh");

            event.put("start", start);
            event.put("end", end);
        } else {
            // If no due date, create all-day event for today
            Map<String, Object> start = new HashMap<>();
            Map<String, Object> end = new HashMap<>();

            LocalDateTime today = LocalDateTime.now();
            start.put("date", today.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            end.put("date", today.plusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

            event.put("start", start);
            event.put("end", end);
        }

        // Set reminder
        Map<String, Object> reminders = new HashMap<>();
        reminders.put("useDefault", false);

        List<Map<String, Object>> overrides = new ArrayList<>();

        // 30 minutes before
        Map<String, Object> reminder1 = new HashMap<>();
        reminder1.put("method", "popup");
        reminder1.put("minutes", 30);
        overrides.add(reminder1);

        // 1 day before
        Map<String, Object> reminder2 = new HashMap<>();
        reminder2.put("method", "email");
        reminder2.put("minutes", 1440); // 24 hours
        overrides.add(reminder2);

        reminders.put("overrides", overrides);
        event.put("reminders", reminders);

        return event;
    }

    /**
     * Get valid access token (refresh if needed)
     */
    private String getValidAccessToken(OAuthToken token) {
        // Check if token is still valid (expires in next 5 minutes)
        if (token.getExpiresAt() != null &&
                token.getExpiresAt().isAfter(LocalDateTime.now().plusMinutes(5))) {
            return token.getAccessToken();
        }

        // Refresh token if needed
        return refreshAccessToken(token);
    }

    /**
     * Refresh OAuth access token
     */
    private String refreshAccessToken(OAuthToken token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String body = "grant_type=refresh_token" +
                    "&refresh_token=" + token.getRefreshToken() +
                    "&client_id=" + System.getenv("GOOGLE_CLIENT_ID") +
                    "&client_secret=" + System.getenv("GOOGLE_CLIENT_SECRET");
            HttpEntity<String> request = new HttpEntity<>(body, headers);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://oauth2.googleapis.com/token",
                    request,
                    Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = (Map<String, Object>) response.getBody();

                String newAccessToken = (String) responseBody.get("access_token");
                Integer expiresIn = (Integer) responseBody.get("expires_in");

                // Update token in database
                token.setAccessToken(newAccessToken);
                token.setExpiresAt(LocalDateTime.now().plusSeconds(expiresIn));

                // Update refresh token if provided
                if (responseBody.containsKey("refresh_token")) {
                    token.setRefreshToken((String) responseBody.get("refresh_token"));
                }

                oAuthTokenRepository.save(token);

                return newAccessToken;
            }

            throw new RuntimeException("Failed to refresh access token");

        } catch (Exception e) {
            throw new RuntimeException("Error refreshing access token: " + e.getMessage());
        }
    }
}
