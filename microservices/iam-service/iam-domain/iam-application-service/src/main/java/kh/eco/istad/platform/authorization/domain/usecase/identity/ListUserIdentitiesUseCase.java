package kh.eco.istad.platform.authorization.domain.usecase.identity;

import kh.eco.istad.platform.authorization.domain.dto.identity.result.IdentityResult;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.user.User;

import java.util.List;
import java.util.UUID;

public class ListUserIdentitiesUseCase {

    private final UserRepository users;

    public ListUserIdentitiesUseCase(UserRepository users) {
        this.users = users;
    }

    public List<IdentityResult> execute(UUID userUuid) {
        User user = Rules.loadUser(users, userUuid);
        return user.getActiveIdentities().stream().map(DomainDtoMapper::toIdentityResult).toList();
    }
}
