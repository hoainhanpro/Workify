package com.workify.backend.service;

import java.util.Date;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.workify.backend.config.JwtProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    /**
     * Tạo JWT token cho user
     */
    public String generateToken(String username, String userId, String role) {
        return createToken(username, userId, role);
    }

    /**
     * Tạo JWT token với các claims tùy chỉnh
     */
    public String generateTokenWithClaims(String username, Map<String, Object> claims) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration() * 1000))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Tạo token cơ bản
     */
    private String createToken(String username, String userId, String role) {
        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration() * 1000))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Tạo refresh token
     */
    public String generateRefreshToken(String username, String userId) {
        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("type", "refresh")
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration() * 1000 * 7)) // 7 ngày
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validate token
     */
    public boolean validateToken(String token, String username) {
        try {
            // Kiểm tra xem token có bị thu hồi không
            if (tokenBlacklistService.isTokenRevoked(token)) {
                return false;
            }

            final String extractedUsername = extractUsername(token);
            return (extractedUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Validate token mà không cần username
     */
    public boolean isTokenValid(String token) {
        try {
            if (tokenBlacklistService.isTokenRevoked(token)) {
                return false;
            }
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extract username từ token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract user ID từ token
     */
    public String extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", String.class));
    }

    /**
     * Extract role từ token
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Extract token type
     */
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    /**
     * Extract expiration date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract issued at date
     */
    public Date extractIssuedAt(String token) {
        return extractClaim(token, Claims::getIssuedAt);
    }

    /**
     * Extract một claim cụ thể từ token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract tất cả claims từ token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Kiểm tra token có hết hạn không
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Thu hồi token (thêm vào blacklist)
     */
    public void revokeToken(String token, String userId, String reason) {
        tokenBlacklistService.revokeToken(token, userId, reason);
    }

    /**
     * Kiểm tra token có bị thu hồi không
     */
    public boolean isTokenRevoked(String token) {
        return tokenBlacklistService.isTokenRevoked(token);
    }

    /**
     * Thu hồi tất cả token của user
     */
    public void revokeAllTokensForUser(String userId, String reason) {
        tokenBlacklistService.revokeAllTokensForUser(userId, reason);
    }

    /**
     * Làm mới token
     */
    public String refreshToken(String refreshToken) {
        if (!isTokenValid(refreshToken)) {
            throw new JwtException("Invalid refresh token");
        }

        String tokenType = extractTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new JwtException("Token is not a refresh token");
        }

        String username = extractUsername(refreshToken);
        String userId = extractUserId(refreshToken);
        
        // Lấy role từ database hoặc từ token (tùy business logic)
        // Ở đây giả sử role không thay đổi
        String role = "USER"; // TODO: Fetch from database
        
        return generateToken(username, userId, role);
    }

    /**
     * Lấy signing key
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Lấy thời gian còn lại của token (tính bằng milliseconds)
     */
    public long getTokenRemainingTime(String token) {
        Date expiration = extractExpiration(token);
        return expiration.getTime() - System.currentTimeMillis();
    }

    /**
     * Kiểm tra token có sắp hết hạn không (trong vòng 5 phút)
     */
    public boolean isTokenExpiringSoon(String token) {
        long remainingTime = getTokenRemainingTime(token);
        return remainingTime < 300000; // 5 phút = 300000 ms
    }
}
