package kh.eco.istad.iamservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 15)
public class OAuthRegistrationFallbackFilter extends OncePerRequestFilter {

    private final ClientRegistrationRepository registrations;

    public OAuthRegistrationFallbackFilter(ClientRegistrationRepository registrations) {
        this.registrations = registrations;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (("GET".equalsIgnoreCase(request.getMethod()) || "HEAD".equalsIgnoreCase(request.getMethod())) && uri.startsWith("/oauth2/authorization/")) {
            String provider = uri.substring("/oauth2/authorization/".length());
            if (provider.contains("/")) {
                provider = provider.substring(0, provider.indexOf('/'));
            }
            var reg = registrations.findByRegistrationId(provider);
            if (reg == null || reg.getClientId() == null || reg.getClientId().isBlank()) {
                response.sendRedirect("/login?oauth_error=" + provider);
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
