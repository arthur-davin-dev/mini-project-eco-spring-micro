package kh.eco.istad.iamservice.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;

@Component
public class HostAwareLogoutSuccessHandler implements LogoutSuccessHandler {

    private static final String LOGIN_LOGOUT_PATH = "/login?logout";

    private final String publicHost;
    private final String localBaseUrl;

    public HostAwareLogoutSuccessHandler(
            @Value("${iam.security.public-base-url:}") String publicBaseUrl,
            @Value("${iam.security.local-base-url:http://localhost:9000}") String localBaseUrl) {
        this.publicHost = publicBaseUrl == null || publicBaseUrl.isBlank()
                ? null
                : URI.create(publicBaseUrl.strip()).getHost();
        this.localBaseUrl = localBaseUrl.strip().replaceAll("/+$", "");
    }

    @Override
    public void onLogoutSuccess(HttpServletRequest request,
                                HttpServletResponse response,
                                Authentication authentication) throws IOException {
        boolean onPublicHost = publicHost != null && publicHost.equalsIgnoreCase(request.getServerName());
        response.sendRedirect(onPublicHost ? localBaseUrl + LOGIN_LOGOUT_PATH : LOGIN_LOGOUT_PATH);
    }
}