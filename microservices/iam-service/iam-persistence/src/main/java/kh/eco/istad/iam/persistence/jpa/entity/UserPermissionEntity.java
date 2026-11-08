package kh.eco.istad.iam.persistence.jpa.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "user_permissions")
public class UserPermissionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "permission_id", nullable = false)
    private Long permissionId;
    @Column(nullable = false, length = 5)
    private String effect;
    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;
    @Column(name = "assigned_by", nullable = false, length = 100)
    private String assignedBy;
    @Column(name = "expires_at")
    private Instant expiresAt;
    @Column(name = "revoked_at")
    private Instant revokedAt;
    @Column(name = "revoked_by", length = 100)
    private String revokedBy;
    @Column(length = 255)
    private String reason;
}
