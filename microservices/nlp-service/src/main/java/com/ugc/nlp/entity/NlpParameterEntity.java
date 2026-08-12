package com.ugc.nlp.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

@Document(collection = "nlp_parameters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NlpParameterEntity {

    @Id
    private String id;

    private String param;

    private String declared;

    private String verified;

    private String status;

    private Integer confidence;

    private Boolean critical;

    private String applicationId;
}
