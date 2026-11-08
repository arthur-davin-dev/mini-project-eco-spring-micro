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

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "permissions")
public class PermissionEntity extends AuditedRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 100)
    private UUID uuid;
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    @Column(nullable = false, length = 50)
    private String resource;
    @Column(nullable = false, length = 50)
    private String action;
    @Column(length = 255)
    private String description;
    @Column(name = "is_system", nullable = false)
    private boolean system;
    @Column(name = "is_active", nullable = false)
    private boolean active;
}
