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
import { RouterModule } from '@angular/router';
// import { ImageUploadService } from '../../utils/image-upload.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

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

  // ✅ Keep file/avatar vars but we won't use them
  selectedFile: File | null = null;
  avatarPreview: string | null = null;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    // private imageUploadService: ImageUploadService, // ✅ won't be used now
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router
  ) {
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
      profilePic: [''] // ✅ will always stay empty
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          localStorage.setItem('token', res.token);
          this.router.navigate(['/explore']);
          console.log('JWT Token:', res.token);
        },
        error: (err) => {
          this.snackBar.open(err.error || 'Invalid credentials', 'Close', { duration: 4000 });
        }
      });
    }
  }

  async onRegister() {
    if (this.registerForm.valid) {
      // ✅ Comment out all avatar/file upload logic
      /*
      let uploadedFile: { secure_url: string; public_id: string; resourceType: 'image' | 'video' } | null = null;

      if (this.selectedFile) {
        try {
          this.isUploading = true;
          uploadedFile = await this.imageUploadService.uploadImage(this.selectedFile);
          console.log("File uploaded:", uploadedFile);

          this.registerForm.patchValue({ profilePic: uploadedFile.secure_url });
        } catch (err: any) {
          this.snackBar.open(err.message || 'File upload failed', 'Close', { duration: 4000 });
          return;
        } finally {
          this.isUploading = false;
        }
      }
      */

      // ✅ Always assign empty string to profilePic
      this.registerForm.patchValue({ profilePic: '' });

      console.log("Register data:", this.registerForm.value);

      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.snackBar.open('User registered successfully!', 'Close', { duration: 3000 });
          console.log('Registered user:', res);
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Registration failed', 'Close', { duration: 4000 });
        }
      });
    }
  }

  // ✅ Comment out avatar handlers, keep them if you want later
  /*
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
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
  */
}
