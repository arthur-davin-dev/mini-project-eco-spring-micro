package kh.eco.istad.platform.business.persistence.document;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "businesses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessDocument {

    @Id
    private BusinessId id;

    private String legalName;

    private String displayName;

    @Indexed(unique = true)
    private String email;

    private String phoneNumber;

    private boolean active;

    @Builder.Default
    private List<ProductDocument> products = new ArrayList<>();
}
