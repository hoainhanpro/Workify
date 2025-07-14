package com.workify.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.workify.backend.config.GoogleOAuthProperties;
import com.workify.backend.config.JwtProperties;
import com.workify.backend.dto.GoogleCallbackRequest;
import com.workify.backend.dto.GoogleOAuthResponse;
import com.workify.backend.dto.GoogleTokenResponse;
import com.workify.backend.dto.GoogleUserInfo;
import com.workify.backend.dto.UserResponse;
import com.workify.backend.model.OAuthToken;
import com.workify.backend.model.User;
import com.workify.backend.repository.OAuthTokenRepository;
import com.workify.backend.repository.UserRepository;

@Service
public class GoogleOAuthService {

    @Autowired
    private GoogleOAuthProperties googleOAuthProperties;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OAuthTokenRepository oAuthTokenRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Xử lý Google OAuth callback
     */
    public GoogleOAuthResponse handleGoogleCallback(GoogleCallbackRequest request) {
        try {
            // 1. Exchange authorization code cho access token
            GoogleTokenResponse tokenResponse = exchangeCodeForTokens(request.getCode(), request.getRedirectUri());
            
            // 2. Lấy user info từ Google
            GoogleUserInfo googleUserInfo = getUserInfoFromGoogle(tokenResponse.getAccessToken());
            
            // 3. Tìm hoặc tạo user
            User user = findOrCreateUser(googleUserInfo);
            
            // 4. Lưu Google refresh token (nếu có)
            if (tokenResponse.getRefreshToken() != null) {
                saveGoogleRefreshToken(user.getId(), tokenResponse.getRefreshToken(), tokenResponse.getScope());
            }
            
            // 5. Tạo JWT tokens cho hệ thống
            String accessToken = jwtService.generateToken(user.getUsername(), user.getId(), user.getRole());
            String refreshToken = jwtService.generateRefreshToken(user.getUsername(), user.getId());
            
            // 6. Tạo response
            UserResponse userResponse = new UserResponse(user);
            GoogleOAuthResponse response = new GoogleOAuthResponse(accessToken, refreshToken, userResponse, false);
            response.setGoogleAccessToken(tokenResponse.getAccessToken());
            response.setExpiresIn(jwtProperties.getExpiration());
            
            return response;
            
        } catch (Exception e) {
            throw new RuntimeException("Google OAuth authentication failed: " + e.getMessage(), e);
        }
    }

    /**
     * Exchange authorization code cho access token và refresh token
     */
    private GoogleTokenResponse exchangeCodeForTokens(String code, String redirectUri) {
        try {
            // Log OAuth properties for debugging
            System.out.println("DEBUG - Google OAuth Config:");
            System.out.println("Client ID: " + googleOAuthProperties.getClientId());
            System.out.println("Client Secret: " + (googleOAuthProperties.getClientSecret() != null ? "[SET]" : "[NOT SET]"));
            System.out.println("Redirect URI: " + redirectUri);
            System.out.println("Token URI: " + googleOAuthProperties.getTokenUri());
            
            // Tạo request body
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("client_id", googleOAuthProperties.getClientId());
            params.add("client_secret", googleOAuthProperties.getClientSecret());
            params.add("code", code);
            params.add("grant_type", "authorization_code");
            params.add("redirect_uri", redirectUri);

            // Tạo headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

            // Gửi request đến Google
            ResponseEntity<GoogleTokenResponse> response = restTemplate.exchange(
                googleOAuthProperties.getTokenUri(),
                HttpMethod.POST,
                entity,
                GoogleTokenResponse.class
            );

            if (response.getBody() == null) {
                throw new RuntimeException("Failed to get tokens from Google");
            }

            return response.getBody();
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            System.out.println("DEBUG - Google token exchange error response: " + errorBody);
            
            // Check for specific error types
            if (errorBody.contains("invalid_grant")) {
                throw new RuntimeException("Authorization code has already been used or is invalid. Please try logging in again.", e);
            } else if (errorBody.contains("invalid_client")) {
                throw new RuntimeException("Invalid OAuth client configuration", e);
            } else {
                throw new RuntimeException("HTTP error during token exchange: " + e.getStatusCode() + " " + e.getStatusText() + " on POST request for \"" + googleOAuthProperties.getTokenUri() + "\": \"" + errorBody + "\"", e);
            }
        } catch (ResourceAccessException e) {
            throw new RuntimeException("Network error during token exchange: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to exchange code for tokens: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy user info từ Google UserInfo API
     */
    private GoogleUserInfo getUserInfoFromGoogle(String accessToken) {
        try {
            // Tạo headers với Bearer token
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            // Gửi request đến Google UserInfo API
            ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
                googleOAuthProperties.getUserInfoUri(),
                HttpMethod.GET,
                entity,
                GoogleUserInfo.class
            );

            if (response.getBody() == null) {
                throw new RuntimeException("Failed to get user info from Google");
            }

            return response.getBody();
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to get user info from Google: " + e.getMessage(), e);
        }
    }

    /**
     * Tìm user theo Google ID hoặc email, hoặc tạo user mới
     */
    private User findOrCreateUser(GoogleUserInfo googleUserInfo) {
        // Kiểm tra email
        if (googleUserInfo.getEmail() == null || googleUserInfo.getEmail().isEmpty()) {
            throw new RuntimeException("Google account does not have email address");
        }

        // Kiểm tra Google ID
        if (googleUserInfo.getId() == null || googleUserInfo.getId().isEmpty()) {
            throw new RuntimeException("Google account does not have valid ID");
        }

        // 1. Ưu tiên tìm user theo Google ID trước (user đã login Google trước đó)
        Optional<User> existingUserByGoogleId = userRepository.findByGoogleId(googleUserInfo.getId());
        if (existingUserByGoogleId.isPresent()) {
            // User đã tồn tại với Google ID này - đây là login lần 2+
            User user = existingUserByGoogleId.get();
            
            // Cập nhật thông tin mới nhất từ Google
            user.setProfilePicture(googleUserInfo.getPicture());
            if (googleUserInfo.getName() != null && !googleUserInfo.getName().isEmpty()) {
                user.setFullName(googleUserInfo.getName());
            }
            
            // Cập nhật email nếu có thay đổi
            if (!user.getEmail().equals(googleUserInfo.getEmail())) {
                // Kiểm tra email mới có bị trùng với user khác không
                Optional<User> userWithSameEmail = userRepository.findByEmail(googleUserInfo.getEmail());
                if (userWithSameEmail.isEmpty() || userWithSameEmail.get().getId().equals(user.getId())) {
                    user.setEmail(googleUserInfo.getEmail());
                }
            }
            
            return userRepository.save(user);
        }

        // 2. Tìm user theo email (trường hợp user đã có account local, giờ link Google)
        Optional<User> existingUserByEmail = userRepository.findByEmail(googleUserInfo.getEmail());
        if (existingUserByEmail.isPresent()) {
            // User đã tồn tại với email này, giờ thêm Google ID vào
            User user = existingUserByEmail.get();
            user.setGoogleId(googleUserInfo.getId());
            user.setProfilePicture(googleUserInfo.getPicture());
            
            // Nếu user chỉ có LOCAL auth, có thể set thành MIXED hoặc giữ nguyên
            if ("LOCAL".equals(user.getAuthProvider())) {
                // Để user có thể login bằng cả 2 cách
                user.setAuthProvider("MIXED"); // hoặc giữ "LOCAL" 
            }
            
            return userRepository.save(user);
        }

        // 3. Tạo user mới hoàn toàn (lần đầu login Google)
        User newUser = new User();
        newUser.setEmail(googleUserInfo.getEmail());
        newUser.setFullName(googleUserInfo.getName() != null ? googleUserInfo.getName() : "Google User");
        newUser.setGoogleId(googleUserInfo.getId());
        newUser.setProfilePicture(googleUserInfo.getPicture());
        newUser.setAuthProvider("GOOGLE");
        newUser.setRole("USER");
        newUser.setEnabled(true);
        
        // Tạo username unique từ email
        String baseUsername = generateUsernameFromEmail(googleUserInfo.getEmail());
        newUser.setUsername(ensureUniqueUsername(baseUsername));
        
        // Tạo random password (user không thể login bằng password)
        String randomPassword = UUID.randomUUID().toString();
        newUser.setPassword(passwordEncoder.encode(randomPassword));
        
        return userRepository.save(newUser);
    }

    /**
     * Lưu Google refresh token vào database
     */
    private void saveGoogleRefreshToken(String userId, String refreshToken, String scope) {
        try {
            // Tìm existing token
            Optional<OAuthToken> existingToken = oAuthTokenRepository.findByUserIdAndProvider(userId, "GOOGLE");
            
            OAuthToken oAuthToken;
            if (existingToken.isPresent()) {
                // Cập nhật token hiện tại
                oAuthToken = existingToken.get();
                oAuthToken.setRefreshToken(refreshToken);
                oAuthToken.setScope(scope);
                oAuthToken.setUpdatedAt(LocalDateTime.now());
            } else {
                // Tạo token mới
                oAuthToken = new OAuthToken();
                oAuthToken.setUserId(userId);
                oAuthToken.setProvider("GOOGLE");
                oAuthToken.setRefreshToken(refreshToken);
                oAuthToken.setScope(scope);
                oAuthToken.setCreatedAt(LocalDateTime.now());
            }
            
            // Set expiration (Google refresh token thường không hết hạn trừ khi bị revoke)
            // Có thể set 1 năm hoặc null
            oAuthToken.setExpiresAt(LocalDateTime.now().plusYears(1));
            
            oAuthTokenRepository.save(oAuthToken);
            
        } catch (Exception e) {
            // Log error nhưng không fail toàn bộ flow
            System.err.println("Failed to save Google refresh token: " + e.getMessage());
        }
    }

    /**
     * Tạo username từ email
     */
    private String generateUsernameFromEmail(String email) {
        String localPart = email.split("@")[0];
        // Loại bỏ ký tự đặc biệt và chỉ giữ lại chữ cái, số
        return localPart.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
    }

    /**
     * Đảm bảo username là unique
     */
    private String ensureUniqueUsername(String baseUsername) {
        String username = baseUsername;
        int counter = 1;
        
        // Kiểm tra độ dài minimum
        if (username.length() < 3) {
            username = "google_" + username;
        }
        
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + "_" + counter;
            counter++;
        }
        
        return username;
    }

    /**
     * Refresh Google access token
     */
    public String refreshGoogleAccessToken(String userId) {
        try {
            Optional<OAuthToken> oAuthToken = oAuthTokenRepository.findByUserIdAndProvider(userId, "GOOGLE");
            
            if (oAuthToken.isEmpty() || oAuthToken.get().getRefreshToken() == null) {
                throw new RuntimeException("No Google refresh token found for user");
            }
            
            // Tạo request để refresh token
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("client_id", googleOAuthProperties.getClientId());
            params.add("client_secret", googleOAuthProperties.getClientSecret());
            params.add("refresh_token", oAuthToken.get().getRefreshToken());
            params.add("grant_type", "refresh_token");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

            ResponseEntity<GoogleTokenResponse> response = restTemplate.exchange(
                googleOAuthProperties.getTokenUri(),
                HttpMethod.POST,
                entity,
                GoogleTokenResponse.class
            );

            GoogleTokenResponse responseBody = response.getBody();
            if (responseBody == null || responseBody.getAccessToken() == null) {
                throw new RuntimeException("Failed to refresh Google access token");
            }

            return responseBody.getAccessToken();
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to refresh Google access token: " + e.getMessage(), e);
        }
    }

    /**
     * Link Google account to existing user
     */
    public GoogleOAuthResponse linkGoogleAccount(GoogleCallbackRequest request, String userId) {
        try {
            // 1. Exchange authorization code cho access token
            GoogleTokenResponse tokenResponse = exchangeCodeForTokens(request.getCode(), request.getRedirectUri());
            
            // 2. Lấy user info từ Google
            GoogleUserInfo googleUserInfo = getUserInfoFromGoogle(tokenResponse.getAccessToken());
            
            // 3. Kiểm tra user hiện tại
            Optional<User> existingUser = userRepository.findById(userId);
            if (existingUser.isEmpty()) {
                throw new RuntimeException("User not found");
            }
            
            User user = existingUser.get();
            
            // 4. Kiểm tra email conflict
            if (!user.getEmail().equals(googleUserInfo.getEmail())) {
                // Check if another user has this Google email
                Optional<User> googleEmailUser = userRepository.findByEmail(googleUserInfo.getEmail());
                if (googleEmailUser.isPresent() && !googleEmailUser.get().getId().equals(userId)) {
                    throw new RuntimeException("This Google account is already linked to another user");
                }
            }
            
            // 5. Cập nhật user với Google info
            user.setGoogleId(googleUserInfo.getId());
            if (user.getProfilePicture() == null || user.getProfilePicture().isEmpty()) {
                user.setProfilePicture(googleUserInfo.getPicture());
            }
            userRepository.save(user);
            
            // 6. Lưu Google refresh token (nếu có)
            if (tokenResponse.getRefreshToken() != null) {
                saveGoogleRefreshToken(user.getId(), tokenResponse.getRefreshToken(), tokenResponse.getScope());
            }
            
            // 7. Tạo response
            UserResponse userResponse = new UserResponse(user);
            GoogleOAuthResponse response = new GoogleOAuthResponse(null, null, userResponse, false);
            response.setGoogleAccessToken(tokenResponse.getAccessToken());
            
            return response;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to link Google account: " + e.getMessage(), e);
        }
    }

    /**
     * Unlink Google account from user
     */
    public void unlinkGoogleAccount(String userId) {
        try {
            // 1. Tìm user
            Optional<User> existingUser = userRepository.findById(userId);
            if (existingUser.isEmpty()) {
                throw new RuntimeException("User not found");
            }
            
            User user = existingUser.get();
            
            // 2. Kiểm tra xem có thể unlink không
            if ("GOOGLE".equals(user.getAuthProvider()) && (user.getPassword() == null || user.getPassword().isEmpty())) {
                throw new RuntimeException("Cannot unlink Google account. This is your only login method. Please set a password first.");
            }
            
            // 3. Xóa Google info từ user
            user.setGoogleId(null);
            // Không xóa profilePicture vì user có thể muốn giữ lại
            userRepository.save(user);
            
            // 4. Xóa OAuth token
            oAuthTokenRepository.deleteByUserIdAndProvider(userId, "GOOGLE");
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to unlink Google account: " + e.getMessage(), e);
        }
    }

    /**
     * Get linked OAuth accounts for user
     */
    public Map<String, Object> getLinkedAccounts(String userId) {
        try {
            // 1. Tìm user
            Optional<User> existingUser = userRepository.findById(userId);
            if (existingUser.isEmpty()) {
                throw new RuntimeException("User not found");
            }
            
            User user = existingUser.get();
            Map<String, Object> linkedAccounts = new HashMap<>();
            
            // 2. Check Google linking
            boolean hasGoogleId = user.getGoogleId() != null && !user.getGoogleId().isEmpty();
            Optional<OAuthToken> googleToken = oAuthTokenRepository.findByUserIdAndProvider(userId, "GOOGLE");
            
            if (hasGoogleId || googleToken.isPresent()) {
                Map<String, Object> googleAccount = new HashMap<>();
                googleAccount.put("provider", "GOOGLE");
                googleAccount.put("email", user.getEmail());
                googleAccount.put("linkedAt", user.getCreatedAt());
                googleAccount.put("hasRefreshToken", googleToken.isPresent());
                linkedAccounts.put("google", googleAccount);
            }
            
            // 3. Có thể thêm các provider khác ở đây (Facebook, etc.)
            
            return linkedAccounts;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to get linked accounts: " + e.getMessage(), e);
        }
    }

    // Getter methods for configuration testing
    public String getClientId() {
        return googleOAuthProperties.getClientId();
    }

    public String getClientSecret() {
        return googleOAuthProperties.getClientSecret();
    }

    public String getRedirectUri() {
        return googleOAuthProperties.getRedirectUri();
    }

    public String getScope() {
        return googleOAuthProperties.getScope();
    }
}
