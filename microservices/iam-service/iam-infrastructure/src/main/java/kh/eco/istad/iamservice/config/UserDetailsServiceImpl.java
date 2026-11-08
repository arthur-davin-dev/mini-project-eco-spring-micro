package kh.eco.istad.iamservice.config;

import kh.eco.istad.platform.authorization.domain.usecase.user.LoadUserForAuthenticationUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final LoadUserForAuthenticationUseCase loadUser;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = loadUser.execute(username)
                .orElseThrow(() -> new UsernameNotFoundException("Username not found"));
        // The authorization server persists the authenticated principal with each
        // authorization code. Use Spring Security's serializable, allow-listed
        // User principal so JDBC authorization deserialization can restore it.
        return User.withUsername(user.username())
                .password(user.passwordHash())
                .authorities(user.authorities().stream().map(SimpleGrantedAuthority::new).toList())
                .accountExpired(!user.accountNonExpired())
                .accountLocked(!user.accountNonLocked())
                .credentialsExpired(!user.credentialsNonExpired())
                .disabled(!user.enabled())
                .build();
    }
}
