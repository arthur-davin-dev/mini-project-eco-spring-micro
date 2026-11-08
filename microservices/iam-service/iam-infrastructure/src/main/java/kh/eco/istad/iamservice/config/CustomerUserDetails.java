package kh.eco.istad.iamservice.config;

import kh.eco.istad.platform.authorization.domain.dto.user.result.AuthUserResult;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@RequiredArgsConstructor
public class CustomerUserDetails implements UserDetails {

    private final AuthUserResult user;

    public java.util.UUID userUuid() {
        return user.uuid();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.authorities().stream().map(SimpleGrantedAuthority::new).toList();
    }

    @Override
    public @Nullable String getPassword() {
        return user.passwordHash();
    }

    @Override
    public String getUsername() {
        return user.username();
    }

    @Override
    public boolean isAccountNonExpired() {
        return user.accountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.accountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return user.credentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return user.enabled();
    }

    @Override
    public boolean equals(Object obj) {
        return obj instanceof CustomerUserDetails that
                && user.username().equals(that.user.username());
    }

    @Override
    public int hashCode() {
        return user.username().hashCode();
    }
}
