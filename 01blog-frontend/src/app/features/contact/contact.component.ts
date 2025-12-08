import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { LandBarComponent } from "../../shared/components/landNavbar/landBar.component";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LandBarComponent,
    MatSnackBarModule,
  ],
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.css"],
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      reason: ["", Validators.required],
      description: ["", Validators.required],
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const formData = new FormData();
      formData.append("email", this.contactForm.get("email")?.value);
      formData.append("reason", this.contactForm.get("reason")?.value);
      formData.append("description", this.contactForm.get("description")?.value);

      fetch("https://formspree.io/f/xrbnalak", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      })
        .then(res => {
          if (res.ok) {
            this.snackBar.open("Message sent successfully!", "Close", {
              duration: 3000,
              panelClass: ["success-snackbar"]
            });
            this.contactForm.reset();
          } else {
            this.snackBar.open("Failed to send message. Please try again.", "Close", {
              duration: 5000,
              panelClass: ["error-snackbar"]
            });
          }
        })
        .catch(() => {
          this.snackBar.open("Failed to send message. Please try again.", "Close", {
            duration: 5000,
            panelClass: ["error-snackbar"]
          });
        });
    }
  }
}
