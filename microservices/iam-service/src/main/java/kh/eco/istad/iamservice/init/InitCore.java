package kh.eco.istad.iamservice.init;

import jakarta.annotation.PostConstruct;
import kh.eco.istad.iamservice.domain.Permission;
import kh.eco.istad.iamservice.domain.Role;
import kh.eco.istad.iamservice.domain.User;
import kh.eco.istad.iamservice.feature.permission.PermissionJpaRepository;
import kh.eco.istad.iamservice.feature.role.RoleJpaRepository;
import kh.eco.istad.iamservice.feature.user.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class InitCore {

    private final PermissionJpaRepository permissionJpaRepository;
    private final RoleJpaRepository roleJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init(){
        Permission permission = Permission.builder()
                .permission("user:read:all")
                .description("Read all users")
                .build();

        Role role = Role.builder()
                .role("ADMIN")
                .description("Admin ng hz")
                .build();

        User user = User.builder()
                .familyName("chhay")
                .givenName("davin")
                .email("davinchhay@gmail.com")
                .gender("Male")
                .emailVerified(true)
                .username("davin")
                .password(passwordEncoder.encode("davin123"))
                .build();

        if(!userJpaRepository.existsByUsername("davin")){
            role = roleJpaRepository.save(role);
            permission = permissionJpaRepository.save(permission);
            user.setRoles(Set.of(role));
            user.setPermissions(Set.of(permission));
            userJpaRepository.save(user);
        }
    }
}