import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { ReportService } from '../../services/report.service';

interface GeneralReportData {
  reason: string;
  description: string;
  type: 'GENERAL';
  title: string;
}

@Component({
  selector: "app-report",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    NavbarComponent,
    MatSnackBarModule
  ],
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.css"],
})
export class ReportComponent implements OnInit {
  reportForm!: FormGroup;
  isSubmitting: boolean = false;

  reasons: string[] = [
    "Platform issues",
    "Recommending a feature",
    "Bug report",
    "Content violation",
    "Other"
  ];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      reason: ["", Validators.required],
      description: ["", Validators.required],
    });
  }

  onSubmit(): void {
    if (!this.reportForm.valid || this.isSubmitting) return;

    this.isSubmitting = true;

    const reportData: GeneralReportData = {
      reason: this.reportForm.value.reason,
      description: this.reportForm.value.description,
      title: "General Report",
      type: 'GENERAL'
    };

    this.reportService.submitReport(reportData).subscribe({
      next: (res: any) => {
        const message = res?.text || "Report submitted successfully!";
        this.snackBar.open(message, 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.reportForm.reset();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error submitting general report:', err);
        const errorMessage = err.error?.error || "Failed to submit report. Please try again.";
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }
}
