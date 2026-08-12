package com.ugc.analytics.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "analytics")
public class Analytics {

    @Id
    private String id;
    private String category;
    private String type;
    private String name;
    private Integer count;
    private Double percentage;

    public Analytics() {
    }

    public Analytics(String type, String name, Integer count, Double percentage ,  String category) {
        this.type = type;
        this.name = name;
        this.count = count;
        this.percentage = percentage;
        this.category = category;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
