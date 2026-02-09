package com.creatorx.repository.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.UUID;

/**
 * JPA Converter to handle UUID columns stored as String in Java
 * but as UUID type in PostgreSQL database.
 *
 * This explicitly tells JPA to convert between String (Java) and UUID (PostgreSQL).
 */
@Converter(autoApply = false)
public class UuidToStringConverter implements AttributeConverter<String, UUID> {

    @Override
    public UUID convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return UUID.fromString(attribute);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID string: " + attribute, e);
        }
    }

    @Override
    public String convertToEntityAttribute(UUID dbData) {
        return dbData == null ? null : dbData.toString();
    }
}
