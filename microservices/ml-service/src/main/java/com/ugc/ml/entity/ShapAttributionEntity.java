package com.ugc.ml.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

@Document(collection = "shap_attributions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShapAttributionEntity {

    @Id
    private String id;

    private String applicationId;

    private String featureName;

    private Double shapValue;

    private String impactType; // POSITIVE, NEGATIVE

    private String explanation;
}
