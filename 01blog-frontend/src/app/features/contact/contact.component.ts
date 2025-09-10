import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NavbarComponent
  ],
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.css"],
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      reason: ["", Validators.required],
      description: ["", Validators.required],
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log("Form Data:", this.contactForm.value);
      alert("Message sent successfully!");
      this.contactForm.reset();
    }
  }
}
