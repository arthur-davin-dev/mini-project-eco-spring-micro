package kh.eco.istad.iamservice.config;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class FederatedLinkIntent {
    public static final String SESSION_ATTRIBUTE = "iam.federated-link-target";

    public UUID targetForCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null)
            return null;
        var session = attributes.getRequest().getSession(false);
        if (session == null)
            return null;
        Object target = session.getAttribute(SESSION_ATTRIBUTE);
        return target == null ? null : UUID.fromString(target.toString());
    }

    public void clear(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null)
            session.removeAttribute(SESSION_ATTRIBUTE);
    }

    public void clearCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null)
            clear(attributes.getRequest());
    }
}
