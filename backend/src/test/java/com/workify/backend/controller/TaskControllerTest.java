package com.workify.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workify.backend.dto.TaskRequest;
import com.workify.backend.model.Task;
import com.workify.backend.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @Autowired
    private ObjectMapper objectMapper;

    private Task sampleTask;
    private List<Task> sampleTasks;

    @BeforeEach
    void setUp() {
        sampleTask = new Task();
        sampleTask.setId("task-1");
        sampleTask.setTitle("Sample Task");
        sampleTask.setDescription("Sample Description");
        sampleTask.setStatus(Task.TaskStatus.TODO);
        sampleTask.setPriority(Task.TaskPriority.MEDIUM);
        sampleTask.setUserId("user-1");
        sampleTask.setTags(Arrays.asList("sample", "test"));
        sampleTask.setCreatedAt(LocalDateTime.now());
        sampleTask.setUpdatedAt(LocalDateTime.now());

        sampleTasks = Arrays.asList(sampleTask);
    }

    @Test
    @WithMockUser(username = "user-1")
    void getAllTasks_ShouldReturnTasksList() throws Exception {
        when(taskService.getAllTasksByUserId("user-1")).thenReturn(sampleTasks);

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").value("Sample Task"))
                .andExpect(jsonPath("$.count").value(1));
    }

    @Test
    @WithMockUser(username = "user-1")
    void getTaskById_ShouldReturnTask() throws Exception {
        when(taskService.getTaskByIdAndUserId("task-1", "user-1")).thenReturn(Optional.of(sampleTask));

        mockMvc.perform(get("/api/tasks/task-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Sample Task"));
    }

    @Test
    @WithMockUser(username = "user-1")
    void getTaskById_ShouldReturn404_WhenTaskNotFound() throws Exception {
        when(taskService.getTaskByIdAndUserId("nonexistent", "user-1")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/tasks/nonexistent"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(username = "user-1")
    void getTasksByStatus_ShouldReturnFilteredTasks() throws Exception {
        when(taskService.getTasksByUserIdAndStatus("user-1", Task.TaskStatus.TODO)).thenReturn(sampleTasks);

        mockMvc.perform(get("/api/tasks/status/TODO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.status").value("TODO"));
    }

    @Test
    @WithMockUser(username = "user-1")
    void createTask_ShouldReturnCreatedTask() throws Exception {
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("New Task");
        taskRequest.setDescription("New Description");
        taskRequest.setStatus(Task.TaskStatus.TODO);
        taskRequest.setPriority(Task.TaskPriority.HIGH);
        taskRequest.setTags(Arrays.asList("new", "task"));

        when(taskService.createTask(any(Task.class))).thenReturn(sampleTask);

        mockMvc.perform(post("/api/tasks")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Task created successfully"));
    }

    @Test
    @WithMockUser(username = "user-1")
    void searchTasks_ShouldReturnSearchResults() throws Exception {
        when(taskService.searchTasksByUserId("user-1", "sample")).thenReturn(sampleTasks);

        mockMvc.perform(get("/api/tasks/search?q=sample"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.searchTerm").value("sample"));
    }

    @Test
    @WithMockUser(username = "user-1")
    void getTaskStatistics_ShouldReturnStatistics() throws Exception {
        TaskService.TaskStatistics stats = new TaskService.TaskStatistics(10, 3, 4, 3);
        when(taskService.getTaskStatistics("user-1")).thenReturn(stats);

        mockMvc.perform(get("/api/tasks/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.total").value(10))
                .andExpect(jsonPath("$.data.todo").value(3))
                .andExpect(jsonPath("$.data.inProgress").value(4))
                .andExpect(jsonPath("$.data.completed").value(3));
    }

    @Test
    void getAllTasks_ShouldReturn401_WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }
}
