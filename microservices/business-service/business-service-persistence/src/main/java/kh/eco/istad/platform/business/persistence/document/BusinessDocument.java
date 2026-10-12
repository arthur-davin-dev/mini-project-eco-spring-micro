package kh.eco.istad.platform.business.persistence.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "businesses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessDocument {

    @Id
    private String id;

    private String legalName;

    private String displayName;

    @Indexed(unique = true)
    private String email;

    private String phoneNumber;

    private boolean active;
}