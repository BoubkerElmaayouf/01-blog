package com.cocoon._blog.dto;

import com.cocoon._blog.entity.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReportRequest {

    @NotNull(message = "Report type is required")
    private ReportType type;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotBlank(message = "Description is required")
    private String description;
}
