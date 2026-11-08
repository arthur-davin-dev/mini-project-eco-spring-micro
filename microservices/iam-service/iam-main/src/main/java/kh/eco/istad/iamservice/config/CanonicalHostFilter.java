package kh.eco.istad.iamservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.util.List;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class CanonicalHostFilter extends OncePerRequestFilter {

    private final String canonicalBase;
    private final String canonicalHost;
    private final List<String> paths;

    public CanonicalHostFilter(
            @Value("${iam.security.public-base-url:}") String publicBaseUrl,
            @Value("${iam.security.public-base-url-paths:/oauth2/authorization/telegram}") List<String> paths) {
        if (publicBaseUrl == null || publicBaseUrl.isBlank()) {
            this.canonicalBase = null;
            this.canonicalHost = null;
        } else {
            String trimmed = publicBaseUrl.strip().replaceAll("/+$", "");
            this.canonicalBase = trimmed;
            this.canonicalHost = URI.create(trimmed).getHost();
        }
        this.paths = paths;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if (canonicalBase != null
                && "GET".equals(request.getMethod())
                && matchesPath(request.getRequestURI())
                && !canonicalHost.equalsIgnoreCase(request.getServerName())) {
            String query = request.getQueryString();
            response.sendRedirect(canonicalBase + request.getRequestURI() + (query != null ? "?" + query : ""));
            return;
        }
        chain.doFilter(request, response);
    }

    private boolean matchesPath(String uri) {
        return paths.stream().anyMatch(uri::startsWith);
    }
}