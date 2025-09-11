import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";

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
    NavbarComponent
  ],
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.css"],
})
export class ReportComponent implements OnInit {
  reportForm!: FormGroup;

  reasons: string[] = [
    "Platform issues",
    "Recommending a feature",
    "Bug report",
    "Content violation",
    "Other"
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      reason: ["", Validators.required],
      description: ["", Validators.required],
    });
  }

  onSubmit(): void {
    if (this.reportForm.valid) {
      console.log("Report submitted:", this.reportForm.value);
      alert("Your report has been sent. Thank you!");
      this.reportForm.reset();
    }
  }
}
