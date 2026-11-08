package kh.eco.istad.iam.web.controller;

import java.util.List;

public record ConnectedApplicationView(
        String registeredClientId,
        String clientName,
        List<String> scopes
) {
    public ConnectedApplicationView {
        scopes = List.copyOf(scopes);
    }
}
