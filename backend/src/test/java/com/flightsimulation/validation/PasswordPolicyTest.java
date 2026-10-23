package com.flightsimulation.validation;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class PasswordPolicyTest {
 @Test void acceptsAsciiBoundaries(){assertTrue(PasswordPolicy.Validator.valid("a".repeat(12)));assertTrue(PasswordPolicy.Validator.valid("a".repeat(72)));}
 @Test void rejectsTooShortOrLong(){assertFalse(PasswordPolicy.Validator.valid(null));assertFalse(PasswordPolicy.Validator.valid("a".repeat(11)));assertFalse(PasswordPolicy.Validator.valid("a".repeat(73)));}
 @Test void measuresUtf8Bytes(){assertTrue(PasswordPolicy.Validator.valid("\u754c".repeat(24)));assertFalse(PasswordPolicy.Validator.valid("\u754c".repeat(25)));assertFalse(PasswordPolicy.Validator.valid("\uD83D\uDE00".repeat(11)));assertTrue(PasswordPolicy.Validator.valid("\uD83D\uDE00".repeat(12)));}
}
