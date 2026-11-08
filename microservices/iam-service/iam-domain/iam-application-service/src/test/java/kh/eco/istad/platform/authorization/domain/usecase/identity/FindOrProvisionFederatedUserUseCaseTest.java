package kh.eco.istad.platform.authorization.domain.usecase.identity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class FindOrProvisionFederatedUserUseCaseTest {

    @Test
    void fallsBackToEnglishWhenFederationProviderOmitsLocale() {
        assertEquals("en", FindOrProvisionFederatedUserUseCase.supportedLocale(null));
    }

    @Test
    void acceptsSupportedLocale() {
        assertEquals("km", FindOrProvisionFederatedUserUseCase.supportedLocale("km"));
    }

    @Test
    void fallsBackForUnsupportedLocale() {
        assertEquals("en", FindOrProvisionFederatedUserUseCase.supportedLocale("fr"));
    }
}
