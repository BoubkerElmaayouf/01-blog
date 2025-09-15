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
import { AuthService } from '../../core/auth.service';
import {Router} from '@angular/router';

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

  constructor(private fb: FormBuilder ,  private imageUploadService: ImageUploadService, private snackBar: MatSnackBar, private authService: AuthService, private router: Router) {
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
      profilePic: ['']
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });

          // ✅ Save JWT in localStorage
          localStorage.setItem('token', res.token);
          // Router.navigate(['']);
          this.router.navigate(['/explore']);
          console.log('JWT Token:', res.token);
        },
        error: (err) => {
          this.snackBar.open(err.error || 'Invalid credentials', 'Close', { duration: 4000 });
        }
      });
    } else {
      console.log('Login form is invalid');
    }
  }



  async onRegister() {
    if (this.registerForm.valid) {
      // handle avatar upload (already done in your code)
      if (this.selectedFile) {
        //console.log("selectedFile:", this.selectedFile);
        
        try {
          this.isUploading = true;
          const url = await this.imageUploadService.uploadImage(this.selectedFile);
          console.log("Image uploaded:", url);
          
          this.registerForm.patchValue({ profilePic: url });
        } catch (err: any) {
          this.snackBar.open(err.message || 'Image upload failed', 'Close', { duration: 4000 });
          return;
        } finally {
          this.isUploading = false;
        }
      }

      console.log("---------------> ",this.registerForm.value);
      

      // 🚀 Send to backend
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