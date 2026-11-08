package kh.eco.istad.platform.authorization.domain.dto.identity.command;

import kh.eco.istad.platform.authorization.domain.entity.user.IdentityProvider;


public record FederatedIdentityCommand(
        IdentityProvider provider,
        String providerSubject,
        String email,
        boolean emailVerified,
        String displayName,
        String givenName,
        String familyName,
        String username,
        String pictureUrl,
        String locale
) {
}
