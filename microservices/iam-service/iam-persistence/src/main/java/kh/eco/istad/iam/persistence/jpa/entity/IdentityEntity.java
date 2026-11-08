package kh.eco.istad.iam.persistence.jpa.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "identities")
public class IdentityEntity extends AuditedRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private UUID uuid;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(nullable = false, length = 20)
    private String provider;
    @Column(name = "provider_subject", nullable = false, length = 255)
    private String providerSubject;
    @Column(length = 255)
    private String email;
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;
    @Column(name = "display_name", length = 150)
    private String displayName;
    @Column(length = 100)
    private String username;
    @Column(name = "picture_url", length = 500)
    private String pictureUrl;
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> attributes;
    @Column(name = "linked_at", nullable = false)
    private Instant linkedAt;
    @Column(name = "last_login_at")
    private Instant lastLoginAt;
}
