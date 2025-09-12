import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LandBarComponent } from '../../shared/components/landNavbar/landBar.component';
import {RouterModule } from '@angular/router';
import { ImageUploadService } from '../../utils/image-upload.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    LandBarComponent,
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    RouterModule,
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  hideLoginPassword = true;
  hideRegisterPassword = true;
  selectedFile: File | null = null;
  avatarPreview: string | null = null;
  isUploading = false;

  constructor(private fb: FormBuilder ,  private imageUploadService: ImageUploadService, private snackBar: MatSnackBar) {
    this.loginForm = this.fb.group({
      emailOrUsername: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      bio: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      avatarUrl: ['']
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Login form submitted:', this.loginForm.value);
      // Handle login logic here
    } else {
      console.log('Login form is invalid');
    }
  }

async onRegister() {
  if (this.registerForm.valid) {
    if (this.selectedFile) {
      try {
        this.isUploading = true;
        const url = await this.imageUploadService.uploadImage(this.selectedFile);
        this.registerForm.patchValue({ avatarUrl: url });

        // Success snackbar for avatar upload
        this.snackBar.open('Avatar uploaded successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });

      } catch (err: any) {
        //  Error snackbar
        this.snackBar.open(err.message || 'Image upload failed', 'Close', {
          duration: 4000,
          panelClass: ['snackbar-error']
        });
        return; // stop the registration if upload failed
      } finally {
        this.isUploading = false;
      }
    }

    // Success snackbar for registration submission
    this.snackBar.open('Registration form submitted successfully!', 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });

    console.log('Register form submitted:', this.registerForm.value);
    // 🚀 send this.registerForm.value to your backend

  } else {
    // Snackbar for invalid form
    this.snackBar.open('Please fill out all required fields correctly.', 'Close', {
      duration: 4000,
      panelClass: ['snackbar-error']
    });

    console.log('Register form is invalid');
  }
}


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar() {
    this.selectedFile = null;
    this.avatarPreview = null;
  }
}