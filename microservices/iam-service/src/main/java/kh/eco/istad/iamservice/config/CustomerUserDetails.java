package kh.eco.istad.iamservice.config;

import kh.eco.istad.iamservice.domain.User;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;


@RequiredArgsConstructor
public class CustomerUserDetails implements UserDetails {

    private final User user;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        user.getPermissions()
                .forEach(
                        permission -> {
                            authorities.add(
                                    new SimpleGrantedAuthority(permission.getPermission())
                            );
                        }
                );

        user.getRoles()
                .forEach(
                        role -> {
                            authorities.add(
                                    new SimpleGrantedAuthority("ROLE_" + role.getRole())
                            );
                        }
                );
        return authorities;
    }

    @Override
    public @Nullable String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return user.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return user.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof User that) {
            return this.user.getUsername().equals(that.getUsername());
        }
        return false;
    }
}
