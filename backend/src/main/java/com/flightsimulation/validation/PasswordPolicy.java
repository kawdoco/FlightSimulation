package com.flightsimulation.validation;
import jakarta.validation.*;
import java.lang.annotation.*;
@Target({ElementType.FIELD,ElementType.PARAMETER,ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy=PasswordPolicy.Validator.class)
public @interface PasswordPolicy {
 String message() default "Password must contain at least 12 characters and at most 72 UTF-8 bytes";
 Class<?>[] groups() default {};
 Class<? extends Payload>[] payload() default {};
 class Validator implements ConstraintValidator<PasswordPolicy,String>{
  public boolean isValid(String value,ConstraintValidatorContext context){return valid(value);}
  public static boolean valid(String value){return value!=null && value.codePointCount(0,value.length())>=12 && value.getBytes(java.nio.charset.StandardCharsets.UTF_8).length<=72;}
 }
}

