package kh.eco.istad.iamservice.config;

import kh.eco.istad.platform.authorization.domain.usecase.user.LoadUserForAuthenticationUseCase;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class SecurityCurrentActorProvider implements CurrentActorProvider {
    private final LoadUserForAuthenticationUseCase loadUser;

    public SecurityCurrentActorProvider(LoadUserForAuthenticationUseCase loadUser) {
        this.loadUser = loadUser;
    }

    @Override
    public String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return "system";
        }
        if (authentication instanceof JwtAuthenticationToken jwt && jwt.getToken().getSubject() != null) {
            return jwt.getToken().getSubject();
        }
        if (authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails user) {
            return loadUser.execute(user.getUsername())
                    .map(iamUser -> iamUser.uuid().toString())
                    .orElse(user.getUsername());
        }
        return authentication.getName();
    }
}
