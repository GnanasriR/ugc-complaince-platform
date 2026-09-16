package com.ugc.auth.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    INSTITUTION,
    EVALUATOR,
    SENIOR_EVALUATOR,
    EXPERT_ADMIN,
    ADMIN;

    @JsonCreator
    public static Role fromValue(String text) {
        if (text == null) return INSTITUTION;
        String clean = text.trim().toUpperCase();
        if (clean.startsWith("ROLE_")) {
            clean = clean.substring(5);
        }
        for (Role r : Role.values()) {
            if (r.name().equalsIgnoreCase(clean)) {
                return r;
            }
        }
        if (clean.contains("EXPERT")) return EXPERT_ADMIN;
        if (clean.contains("UGC") || clean.contains("OFFICER")) return EVALUATOR;
        if (clean.contains("EVALUATOR")) return EVALUATOR;
        if (clean.contains("ADMIN")) return ADMIN;
        return INSTITUTION;
    }
}
