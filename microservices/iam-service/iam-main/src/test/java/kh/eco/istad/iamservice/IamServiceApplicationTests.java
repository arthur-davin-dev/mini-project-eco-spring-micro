package kh.eco.istad.iamservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.net.URI;
import java.net.URLDecoder;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.time.Duration;
import java.util.stream.Collectors;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "iam.security.dcr.client-secret=test-only-dcr-secret-with-at-least-32-characters")
@AutoConfigureMockMvc
class IamServiceApplicationTests {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtDecoder jwtDecoder;
    @Autowired RegisteredClientRepository registeredClients;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void contextLoads() {
    }

    @Test
    void advertisesOidcDynamicClientRegistration() throws Exception {
        mockMvc.perform(get("/.well-known/openid-configuration"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registration_endpoint", containsString("/connect/register")));
    }

    @Test
    void documentsBearerJwtSecurityForProtectedApiRoutesOnly() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.type").value("http"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.bearerFormat").value("JWT"))
                .andExpect(jsonPath("$.paths['/api/me'].get.security[0].bearerAuth").exists())
                .andExpect(jsonPath("$.paths['/api/auth/register'].post.security").doesNotExist());
    }

    @Test
    @Transactional
    void registersAndReadsAClientUsingTheRfc7591Tokens() throws Exception {
        String initialAccessToken = initialAccessToken();

        var registrationResponse = mockMvc.perform(post("/connect/register")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + initialAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"client_name":"IAM DCR Test Client",
                                 "redirect_uris":["https://client.example.test/callback"],
                                 "grant_types":["authorization_code","refresh_token"],
                                 "response_types":["code"],
                                 "scope":"openid profile email",
                                 "token_endpoint_auth_method":"client_secret_basic"}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        var registration = objectMapper.readTree(registrationResponse.getResponse().getContentAsString());
        String clientId = registration.get("client_id").stringValue();
        String registrationAccessToken = registration.get("registration_access_token").stringValue();

        mockMvc.perform(get("/connect/register")
                        .queryParam("client_id", clientId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + registrationAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.client_name").value("IAM DCR Test Client"))
                .andExpect(jsonPath("$.registration_access_token").doesNotExist());
    }

    @Test
    @Transactional
    void rejectsDynamicRegistrationRequestsForUnapprovedScopes() throws Exception {
        String initialAccessToken = initialAccessToken();
        mockMvc.perform(post("/connect/register")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + initialAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"client_name":"Rejected IAM Client",
                                 "redirect_uris":["https://client.example.test/callback"],
                                 "grant_types":["authorization_code"],
                                 "response_types":["code"],
                                 "scope":"openid user:delete",
                                 "token_endpoint_auth_method":"client_secret_basic"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("invalid_scope"));
    }

    @Test
    @Transactional
    void authorizesWithPkceIssuesScopedOidcClaimsAndRotatesRefreshTokens() throws Exception {
        String clientId = "pkce-test-client";
        String clientSecret = "test-only-pkce-client-secret";
        String redirectUri = "https://client.example.test/callback";
        registeredClients.save(RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId(clientId)
                .clientName("PKCE Integration Test")
                .clientSecret(passwordEncoder.encode(clientSecret))
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .redirectUri(redirectUri)
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope(OidcScopes.EMAIL)
                .clientSettings(ClientSettings.builder()
                        .requireProofKey(true)
                        .requireAuthorizationConsent(false)
                        .build())
                .tokenSettings(TokenSettings.builder()
                        .accessTokenFormat(OAuth2TokenFormat.SELF_CONTAINED)
                        .refreshTokenTimeToLive(Duration.ofDays(7))
                        .reuseRefreshTokens(false)
                        .build())
                .build());

        String unique = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String username = "oauth-" + unique;
        String password = "Str0ng!Pass2026";
        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","email":"%s@example.test",
                                 "password":"%s","confirmPassword":"%s",
                                 "givenName":"OAuth","familyName":"Test","locale":"en"}
                                """.formatted(username, username, password, password)))
                .andExpect(status().isCreated()).andReturn();
        String userUuid = objectMapper.readTree(registration.getResponse().getContentAsString())
                .get("uuid").stringValue();

        String verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
        String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(
                MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII)));
        var authorizationRequest = get("/oauth2/authorize")
                .queryParam("response_type", "code")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("scope", "openid profile email")
                .queryParam("state", unique)
                .queryParam("nonce", "nonce-" + unique)
                .queryParam("code_challenge", challenge)
                .queryParam("code_challenge_method", "S256");
        MvcResult login = mockMvc.perform(post("/login").with(csrf())
                        .param("username", username).param("password", password))
                .andExpect(status().is3xxRedirection()).andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        org.junit.jupiter.api.Assertions.assertNotNull(session, "Successful login should create a session");
        MvcResult callback = mockMvc.perform(authorizationRequest.session(session))
                .andExpect(status().is3xxRedirection()).andReturn();
        String callbackUrl = callback.getResponse().getHeader(HttpHeaders.LOCATION);
        org.junit.jupiter.api.Assertions.assertNotNull(callbackUrl);
        Map<String, String> callbackParameters = java.util.Arrays.stream(URI.create(callbackUrl).getRawQuery().split("&"))
                .map(parameter -> parameter.split("=", 2))
                .collect(Collectors.toMap(pair -> URLDecoder.decode(pair[0], StandardCharsets.UTF_8),
                        pair -> URLDecoder.decode(pair[1], StandardCharsets.UTF_8)));
        org.junit.jupiter.api.Assertions.assertEquals(unique, callbackParameters.get("state"));
        String code = callbackParameters.get("code");
        org.junit.jupiter.api.Assertions.assertNotNull(code, "Authorization response: " + callbackUrl);

        MvcResult tokens = mockMvc.perform(post("/oauth2/token")
                        .header(HttpHeaders.AUTHORIZATION, clientBasic(clientId, clientSecret))
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("grant_type", "authorization_code")
                        .param("client_id", clientId)
                        .param("redirect_uri", redirectUri)
                        .param("code", code)
                        .param("code_verifier", verifier))
                .andExpect(status().isOk()).andReturn();
        var tokenResponse = objectMapper.readTree(tokens.getResponse().getContentAsString());
        String accessToken = tokenResponse.get("access_token").stringValue();
        String refreshToken = tokenResponse.get("refresh_token").stringValue();
        String idToken = tokenResponse.get("id_token").stringValue();

        var accessJwt = jwtDecoder.decode(accessToken);
        org.junit.jupiter.api.Assertions.assertEquals(userUuid, accessJwt.getSubject());
        org.junit.jupiter.api.Assertions.assertEquals(userUuid, accessJwt.getClaimAsString("user_uuid"));
        org.junit.jupiter.api.Assertions.assertNotNull(accessJwt.getClaim("roles"));
        org.junit.jupiter.api.Assertions.assertNotNull(accessJwt.getClaim("permissions"));
        var idJwt = jwtDecoder.decode(idToken);
        org.junit.jupiter.api.Assertions.assertEquals("OAuth Test", idJwt.getClaimAsString("name"));
        org.junit.jupiter.api.Assertions.assertEquals(username, idJwt.getClaimAsString("preferred_username"));
        org.junit.jupiter.api.Assertions.assertEquals(username + "@example.test", idJwt.getClaimAsString("email"));

        MvcResult userInfo = mockMvc.perform(get("/userinfo")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andReturn();
        org.junit.jupiter.api.Assertions.assertEquals(200, userInfo.getResponse().getStatus(),
                userInfo.getResponse().getContentAsString());
        mockMvc.perform(get("/userinfo").header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sub").value(userUuid))
                .andExpect(jsonPath("$.email").value(username + "@example.test"));

        MvcResult refreshed = mockMvc.perform(post("/oauth2/token")
                        .header(HttpHeaders.AUTHORIZATION, clientBasic(clientId, clientSecret))
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("grant_type", "refresh_token")
                        .param("client_id", clientId)
                        .param("refresh_token", refreshToken))
                .andExpect(status().isOk()).andReturn();
        String rotatedRefreshToken = objectMapper.readTree(refreshed.getResponse().getContentAsString())
                .get("refresh_token").stringValue();
        org.junit.jupiter.api.Assertions.assertNotEquals(refreshToken, rotatedRefreshToken);

        mockMvc.perform(post("/oauth2/token")
                        .header(HttpHeaders.AUTHORIZATION, clientBasic(clientId, clientSecret))
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("grant_type", "refresh_token")
                        .param("client_id", clientId)
                        .param("refresh_token", refreshToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("invalid_grant"));
    }

    private static String clientBasic(String clientId, String clientSecret) {
        String credentials = Base64.getEncoder().encodeToString(
                (clientId + ":" + clientSecret).getBytes(StandardCharsets.UTF_8));
        return "Basic " + credentials;
    }

    private String initialAccessToken() throws Exception {
        String registrarCredentials = Base64.getEncoder().encodeToString(
                "iam-client-registrar:test-only-dcr-secret-with-at-least-32-characters"
                        .getBytes(StandardCharsets.UTF_8));
        var tokenResponse = mockMvc.perform(post("/oauth2/token")
                        .header(HttpHeaders.AUTHORIZATION, "Basic " + registrarCredentials)
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("grant_type", "client_credentials")
                        .param("scope", "client.create"))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(tokenResponse.getResponse().getContentAsString())
                .get("access_token").stringValue();
    }
}
