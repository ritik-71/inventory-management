package com.inventory.inventory_management.exception;

import com.inventory.inventory_management.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@ControllerAdvice
public class ApiResponseAdapter implements ResponseBodyAdvice<Object> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        String packageName = returnType.getDeclaringClass().getPackageName();
        return packageName.startsWith("com.inventory.inventory_management.controller");
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        
        if (body instanceof ApiResponse) {
            return body;
        }

        ApiResponse<Object> apiResponse = new ApiResponse<>(true, "Operation successful", body);

        if (body instanceof String) {
            try {
                return objectMapper.writeValueAsString(apiResponse);
            } catch (Exception e) {
                return body;
            }
        }

        return apiResponse;
    }
}
