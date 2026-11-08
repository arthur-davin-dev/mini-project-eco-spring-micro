package kh.eco.istad.iamservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "iam.security.dcr.client-secret=test-only-dcr-secret-with-at-least-32-characters")
@AutoConfigureMockMvc
class IamRestApiIntegrationTests {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    @Transactional
    void exercisesRegistrationUserMeRoleAndPermissionEndpoints() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.type").value("https://iam.istad.co/problems/unauthorized"));
        mockMvc.perform(get("/api/users").with(jwt().authorities(List.of())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.type").value("https://iam.istad.co/problems/forbidden"));

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"x\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.errors[0].field").exists());
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"api-register-%s","email":"api-register-%s@example.test",
                                 "password":"Str0ng!Pass2026","confirmPassword":"Str0ng!Pass2026",
                                 "givenName":"Api","familyName":"Register","locale":"en"}
                                """.formatted(UUID.randomUUID(), UUID.randomUUID())))
                .andExpect(status().isCreated());

        UUID userUuid = UUID.randomUUID();
        var admin = jwt().jwt(token -> token.subject(userUuid.toString()))
                .authorities(authorities("user:create", "user:read", "user:update", "user:delete",
                        "user:assign", "role:create", "role:read", "role:update", "role:delete",
                        "role:assign", "permission:create", "permission:read", "permission:update",
                        "permission:delete"));
        String unique = UUID.randomUUID().toString().substring(0, 8);

        MvcResult createdUser = mockMvc.perform(post("/api/users").with(admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"api-user-%s","email":"api-user-%s@example.test",
                                 "password":"Str0ng!Pass2026","confirmPassword":"Str0ng!Pass2026",
                                 "givenName":"Api","familyName":"User","locale":"en","roleUuids":[]}
                                """.formatted(unique, unique)))
                .andExpect(status().isCreated()).andReturn();
        UUID createdUserUuid = uuid(createdUser, "uuid");

        mockMvc.perform(get("/api/users").with(admin).queryParam("page", "0")
                        .queryParam("size", "5").queryParam("sort", "username,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.page.number").value(0))
                .andExpect(jsonPath("$.page.size").value(5));
        mockMvc.perform(get("/api/users/{uuid}", createdUserUuid).with(admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.uuid").value(createdUserUuid.toString()));
        mockMvc.perform(get("/api/users").with(admin).queryParam("size", "0"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.type").value(containsString("bad-request")));
        mockMvc.perform(patch("/api/users/{uuid}", createdUserUuid).with(admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"givenName\":\"Updated\",\"locale\":\"km\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.givenName").value("Updated"));
        mockMvc.perform(post("/api/users/{uuid}/disable", createdUserUuid).with(admin)).andExpect(status().isNoContent());
        mockMvc.perform(post("/api/users/{uuid}/enable", createdUserUuid).with(admin)).andExpect(status().isNoContent());
        mockMvc.perform(post("/api/users/{uuid}/lock", createdUserUuid).with(admin)).andExpect(status().isNoContent());
        mockMvc.perform(post("/api/users/{uuid}/unlock", createdUserUuid).with(admin)).andExpect(status().isNoContent());
        mockMvc.perform(put("/api/users/{uuid}/password", createdUserUuid).with(admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newPassword\":\"N3w!Pass2026\",\"confirmPassword\":\"N3w!Pass2026\"}"))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/users/{uuid}/authorities", createdUserUuid).with(admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.effectivePermissions").isArray());
        mockMvc.perform(get("/api/users/{uuid}/identities", createdUserUuid).with(admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
        mockMvc.perform(delete("/api/users/{uuid}/identities/{identityUuid}", createdUserUuid, UUID.randomUUID()).with(admin))
                .andExpect(status().isNotFound()).andExpect(content().contentTypeCompatibleWith("application/problem+json"));

        MvcResult createdPermission = mockMvc.perform(post("/api/permissions").with(admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"resource\":\"api_resource\",\"action\":\"read\",\"description\":\"API test\"}"))
                .andExpect(status().isCreated()).andReturn();
        UUID permissionUuid = uuid(createdPermission, "uuid");
        mockMvc.perform(post("/api/permissions").with(admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"resource\":\"api_resource\",\"action\":\"read\",\"description\":\"Duplicate\"}"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.type").value("https://iam.istad.co/problems/conflict"));
        mockMvc.perform(get("/api/permissions").with(admin).queryParam("resource", "api_resource")
                        .queryParam("page", "0").queryParam("size", "10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].uuid").value(permissionUuid.toString()));
        mockMvc.perform(get("/api/permissions/{uuid}", permissionUuid).with(admin)).andExpect(status().isOk());
        mockMvc.perform(patch("/api/permissions/{uuid}", permissionUuid).with(admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"description\":\"Updated API test\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.description").value("Updated API test"));
        mockMvc.perform(post("/api/permissions/{uuid}/deactivate", permissionUuid).with(admin)).andExpect(status().isNoContent());
        mockMvc.perform(post("/api/permissions/{uuid}/activate", permissionUuid).with(admin)).andExpect(status().isNoContent());

        MvcResult createdRole = mockMvc.perform(post("/api/roles").with(admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"API_ROLE_%s\",\"description\":\"API test role\",\"permissionUuids\":[]}".formatted(unique.toUpperCase())))
                .andExpect(status().isCreated()).andReturn();
        UUID roleUuid = uuid(createdRole, "uuid");
        mockMvc.perform(get("/api/roles").with(admin).queryParam("page", "0").queryParam("size", "10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[*].uuid").exists());
        mockMvc.perform(get("/api/roles/{uuid}", roleUuid).with(admin)).andExpect(status().isOk());
        mockMvc.perform(patch("/api/roles/{uuid}", roleUuid).with(admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\":\"Updated API role\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.description").value("Updated API role"));
        mockMvc.perform(post("/api/roles/{uuid}/deactivate", roleUuid).with(admin)).andExpect(status().isNoContent());
        mockMvc.perform(post("/api/roles/{uuid}/activate", roleUuid).with(admin)).andExpect(status().isNoContent());
        mockMvc.perform(post("/api/roles/{uuid}/permissions", roleUuid).with(admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"permissionUuids\":[\"%s\"]}".formatted(permissionUuid)))
                .andExpect(status().isCreated());
        mockMvc.perform(delete("/api/roles/{uuid}/permissions/{permissionUuid}", roleUuid, permissionUuid).with(admin))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/users/{uuid}/roles", createdUserUuid).with(admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"roleUuids\":[\"%s\"]}".formatted(roleUuid)))
                .andExpect(status().isCreated());
        mockMvc.perform(delete("/api/users/{uuid}/roles/{roleUuid}", createdUserUuid, roleUuid).with(admin))
                .andExpect(status().isNoContent());
        mockMvc.perform(post("/api/users/{uuid}/permissions", createdUserUuid).with(admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permissionUuids\":[\"%s\"],\"effect\":\"GRANT\"}".formatted(permissionUuid)))
                .andExpect(status().isCreated());
        mockMvc.perform(delete("/api/users/{uuid}/permissions/{permissionUuid}", createdUserUuid, permissionUuid).with(admin))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/me").with(jwt().jwt(token -> token.subject(createdUserUuid.toString()))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.uuid").value(createdUserUuid.toString()));
        mockMvc.perform(patch("/api/me").with(jwt().jwt(token -> token.subject(createdUserUuid.toString())))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nickname\":\"Self\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nickname").value("Self"));
        mockMvc.perform(put("/api/me/password").with(jwt().jwt(token -> token.subject(createdUserUuid.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"N3w!Pass2026\",\"newPassword\":\"An0ther!Pass2026\",\"confirmPassword\":\"An0ther!Pass2026\"}"))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/me/identities").with(jwt().jwt(token -> token.subject(createdUserUuid.toString()))))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
        mockMvc.perform(delete("/api/me/identities/{identityUuid}", UUID.randomUUID())
                        .with(jwt().jwt(token -> token.subject(createdUserUuid.toString()))))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/users/{uuid}", createdUserUuid).with(admin)).andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/roles/{uuid}", roleUuid).with(admin)).andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/permissions/{uuid}", permissionUuid).with(admin)).andExpect(status().isNoContent());
    }

    private static List<GrantedAuthority> authorities(String... names) {
        return java.util.Arrays.stream(names)
                .map(name -> (GrantedAuthority) new SimpleGrantedAuthority(name))
                .toList();
    }

    private UUID uuid(MvcResult result, String field) throws Exception {
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return UUID.fromString(json.get(field).stringValue());
    }
}
