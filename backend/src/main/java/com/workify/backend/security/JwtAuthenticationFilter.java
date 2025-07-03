package com.workify.backend.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.workify.backend.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Lấy Authorization header
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Kiểm tra Authorization header có hợp lệ không
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT token từ header
        jwt = authHeader.substring(7);

        try {
            // Extract username từ token
            username = jwtService.extractUsername(jwt);

            // Kiểm tra nếu username có giá trị và user chưa được authenticate
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Validate token
                if (jwtService.isTokenValid(jwt)) {

                    // Extract claims từ token (không cần query database)
                    String role = jwtService.extractRole(jwt);
                    String userId = jwtService.extractUserId(jwt);

                    // Tạo UserDetails object từ token claims
                    UserDetails userDetails = User.builder()
                            .username(username)
                            .password("") // Password không cần thiết cho JWT
                            .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)))
                            .accountExpired(false)
                            .accountLocked(false)
                            .credentialsExpired(false)
                            .disabled(false)
                            .build();

                    // Tạo Authentication object
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    // Thêm details cho authentication
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication trong SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    // Thêm user info vào request attributes để controller có thể sử dụng
                    request.setAttribute("userId", userId);
                    request.setAttribute("username", username);
                    request.setAttribute("role", role);
                }
            }
        } catch (Exception e) {
            // Log error và clear security context
            logger.error("Cannot set user authentication: {}", e);
            SecurityContextHolder.clearContext();
        }

        // Continue with filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Kiểm tra xem request có cần được filter không
     * Skip filter cho các public endpoints
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // Skip JWT filter cho các public endpoints
        return path.startsWith("/api/users/register") ||
               path.startsWith("/api/users/login") ||
               path.startsWith("/api/auth/refresh") ||
               path.startsWith("/actuator/") ||
               path.startsWith("/error") ||
               path.equals("/") ||
               path.startsWith("/favicon.ico");
    }
}
