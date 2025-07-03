package com.workify.backend.security;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {
        
        // Set response status to 401 Unauthorized
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Create JSON error response
        String jsonResponse = "{"
                + "\"success\": false,"
                + "\"message\": \"Unauthorized - Invalid or missing authentication token\","
                + "\"error\": \"" + authException.getMessage() + "\","
                + "\"status\": 401,"
                + "\"path\": \"" + request.getRequestURI() + "\""
                + "}";
        
        // Write response
        response.getWriter().write(jsonResponse);
    }
}
