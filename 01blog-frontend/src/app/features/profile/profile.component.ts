import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

import { MatSnackBar } from '@angular/material/snack-bar';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  profilePicture: string;
  statistics: {
    blogsCount: number;
    totalLikes: number;
    totalComments: number;
  };
}

interface UserBlog {
  id: string;
  title: string;
  excerpt: string;
  publishedDate: Date;
  likes: number;
  comments: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    NavbarComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isEditingProfile = false;
  isEditingPassword = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Mock user profile data
  userProfile: UserProfile = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    bio: 'Passionate blogger writing about technology, life, and everything in between. Always eager to share knowledge and connect with like-minded individuals.',
    profilePicture: 'https://i.pinimg.com/736x/a6/db/73/a6db736c419380d2c6102fa8dc2d2d35.jpg',
    statistics: {
      blogsCount: 25,
      totalLikes: 342,
      totalComments: 128
    }
  };

  // Mock user blogs data
  userBlogs: UserBlog[] = [
    {
      id: '1',
      title: 'Getting Started with Angular 17',
      excerpt: 'A comprehensive guide to building modern web applications with the latest Angular features and best practices.',
      publishedDate: new Date('2024-01-15'),
      likes: 45,
      comments: 12,
      imageUrl: 'https://i.pinimg.com/1200x/7e/05/8d/7e058d01d8ee1303f1eeb7d92a7b3c0c.jpg'
    },
    {
      id: '2',
      title: 'The Future of Web Development',
      excerpt: 'Exploring emerging trends and technologies that will shape the future of web development in the coming years.',
      publishedDate: new Date('2024-01-10'),
      likes: 32,
      comments: 8,
      imageUrl: 'https://i.pinimg.com/1200x/7e/05/8d/7e058d01d8ee1303f1eeb7d92a7b3c0c.jpg'
    },
    {
      id: '3',
      title: 'CSS Grid vs Flexbox: When to Use What',
      excerpt: 'Understanding the differences between CSS Grid and Flexbox, and knowing when to use each for optimal layouts.',
      publishedDate: new Date('2024-01-05'),
      likes: 28,
      comments: 15,
      imageUrl: 'https://i.pinimg.com/1200x/7e/05/8d/7e058d01d8ee1303f1eeb7d92a7b3c0c.jpg'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      firstName: [this.userProfile.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.userProfile.lastName, [Validators.required, Validators.minLength(2)]],
      bio: [this.userProfile.bio, [Validators.maxLength(500)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Initialize component
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    
    return null;
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (!this.isEditingProfile) {
      // Reset form to original values if cancelled
      this.profileForm.patchValue({
        firstName: this.userProfile.firstName,
        lastName: this.userProfile.lastName,
        bio: this.userProfile.bio
      });
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  toggleEditPassword(): void {
    this.isEditingPassword = !this.isEditingPassword;
    if (!this.isEditingPassword) {
      this.passwordForm.reset();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      // Update user profile with form data
      this.userProfile.firstName = this.profileForm.value.firstName;
      this.userProfile.lastName = this.profileForm.value.lastName;
      this.userProfile.bio = this.profileForm.value.bio;
      
      // Update profile picture if new one selected
      if (this.previewUrl) {
        this.userProfile.profilePicture = this.previewUrl;
      }
      
      this.isEditingProfile = false;
      this.selectedFile = null;
      this.previewUrl = null;
      
      this.snackBar.open('Profile updated successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  savePassword(): void {
    if (this.passwordForm.valid) {
      // In a real app, you would call an API to update the password
      this.isEditingPassword = false;
      this.passwordForm.reset();
      
      this.snackBar.open('Password updated successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getFullName(): string {
    return `${this.userProfile.firstName} ${this.userProfile.lastName}`;
  }

  getCurrentProfilePicture(): string {
    return this.previewUrl || this.userProfile.profilePicture;
  }
}