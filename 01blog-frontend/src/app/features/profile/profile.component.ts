import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ArticleService, UserProfile, Article } from '../../services/article.service';
import { ImageUploadService } from '../../utils/image-upload.service';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
// import { ReportComponent } from '../report/report.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
// import { Post } from '../admin/admin.component';

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
    MatDialogModule,
    MatMenuModule,
    NavbarComponent,
    // ReportComponent,
    LoaderComponent,
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
  isReportSelected: boolean = false;
  
  // Profile data
  userProfile: UserProfile | null = null;
  currentUserProfile: UserProfile | null = null;
  userArticles: Article[] = [];
  
  // Route state
  isCurrentUserProfile = true;
  profileUserId: number | null = null;
  
  // Follow state
  isFollowing = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private imageUploadService: ImageUploadService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      bio: ['', [Validators.maxLength(500)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.articleService.getUserInfo().subscribe({
      next: (profile) => {
        this.currentUserProfile = profile;
        

        this.route.params.subscribe(params => {
          const userId = params['id'];

          if (userId) {
            this.profileUserId = parseInt(userId);
            if (this.profileUserId === this.currentUserProfile?.id) {
              this.isCurrentUserProfile = true;
              this.loadCurrentUserProfile();
              this.loadMyArticles();
            } else {
              this.isCurrentUserProfile = false;
              this.loadUserProfile(this.profileUserId);
              this.loadUserArticles(this.profileUserId);
            }
          } else {
            this.isCurrentUserProfile = true;
            this.profileUserId = null;
            this.loadCurrentUserProfile();
            this.loadMyArticles();
          }
        });
      },
      error: (err) => {
        console.error("❌ Failed to load current user", err);
        this.showError("Failed to load user information");
      }
    });
  }

  // --- Profile loading ---
  private getCurrentUserInfo(): void {
    this.articleService.getUserInfo().subscribe({
      next: (profile) => {
        this.currentUserProfile = profile;
        if (this.isCurrentUserProfile) {
          this.userProfile = profile;
          this.updateFormWithProfile(profile);
        }
      },
      error: (error) => {
        console.error('Error loading current user info:', error);
        this.showError('Failed to load user information');
      }
    });
  }

  private loadCurrentUserProfile(): void {
    if (this.currentUserProfile) {
      this.userProfile = this.currentUserProfile;
      this.updateFormWithProfile(this.currentUserProfile);
    } else {
      this.getCurrentUserInfo();
    }
  }

  private loadUserProfile(userId: number): void {
    this.articleService.getUserById(userId).subscribe({
      next: (profile) => {
        this.userProfile = profile;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.showError('Failed to load user profile');
        this.router.navigate(['/profile']);
      }
    });
  }

  private loadMyArticles(): void {
    this.articleService.getMyPosts().subscribe({
      next: (articles) => {
        this.userArticles = articles;
      },
      error: (error) => {
        console.error('Error loading articles:', error);
        this.showError('Failed to load articles');
      }
    });
  }

  private loadUserArticles(userId: number): void {
    this.articleService.getPostsByUserId(userId).subscribe({
      next: (articles) => {
        this.userArticles = articles;
      },
      error: (error) => {
        console.error('Error loading user articles:', error);
        this.showError('Failed to load user articles');
      }
    });
  }

  private updateFormWithProfile(profile: UserProfile): void {
    this.profileForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio
    });
  }

  // --- Profile editing ---
  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (!this.isEditingProfile && this.userProfile) {
      this.updateFormWithProfile(this.userProfile);
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrl = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.valid && this.userProfile) {
      this.isLoading = true;

      const updateData: Partial<UserProfile> = {
        id: this.userProfile.id,
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        bio: this.profileForm.value.bio
      };

      try {
        if (this.selectedFile) {
          const uploadRes = await this.imageUploadService.uploadImage(this.selectedFile);
          updateData.profilePic = uploadRes.secure_url;
        }

        this.updateProfileData(updateData);
      } catch (err) {
        console.error('Error uploading profile picture:', err);
        this.showError('Failed to upload profile picture');
        this.isLoading = false;
      }
    } else {
      this.showError('Please fix form errors before saving.');
    }
  }

  private updateProfileData(updateData: Partial<UserProfile>): void {
    this.articleService.updateUserInfo(updateData).subscribe({
      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        this.currentUserProfile = updatedProfile;
        this.isEditingProfile = false;
        this.selectedFile = null;
        this.previewUrl = null;
        this.isLoading = false;
        this.showSuccess('Profile updated successfully!');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isLoading = false;
        this.showError('Failed to update profile');
      }
    });
  }

  // --- Password editing ---
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

  toggleEditPassword(): void {
    this.isEditingPassword = !this.isEditingPassword;
    if (!this.isEditingPassword) {
      this.passwordForm.reset();
    }
  }

  savePassword(): void {
    if (this.passwordForm.valid && this.currentUserProfile?.id != null) {
      this.isLoading = true;

      const passwordData = {
        oldPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword
      }

      this.articleService.changePassword(passwordData).subscribe({
        next: () => {
          this.isEditingPassword = false;
          this.passwordForm.reset();
          this.isLoading = false;
          this.showSuccess('Password updated successfully!');
        },
        error: (error) => {
          console.error('Error updating password:', error);
          this.isLoading = false;

          if (error.status === 400) {
            this.showError('Current password is incorrect');
          } else if (error.status === 422) {
            this.showError('New password does not meet requirements');
          } else {
            this.showError('Failed to update password');
          }
        }
      });
    } else if (!this.currentUserProfile?.id) {
      this.showError('User ID not found. Cannot update password.');
    } else {
      this.showError('Please fix form errors before saving.');
    }
  }

  // --- Follow/Report/Helpers ---
  toggleFollow(): void {
    if (!this.profileUserId || this.isLoading) return;
    this.isLoading = true;
    const followAction = this.isFollowing 
      ? this.articleService.unfollowUser(this.profileUserId)
      : this.articleService.followUser(this.profileUserId);
    
    followAction.subscribe({
      next: () => {
        this.isFollowing = !this.isFollowing;
        this.isLoading = false;
        const message = this.isFollowing ? 'User followed successfully!' : 'User unfollowed successfully!';
        this.showSuccess(message);
      },
      error: (error) => {
        console.error('Error toggling follow:', error);
        this.isLoading = false;
        this.showError('Failed to update follow status');
      }
    });
  }

  reportUser(): void {
    if (!this.profileUserId || !this.userProfile) return;
    this.isReportSelected = true;
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  getFullName(): string {
    return this.userProfile ? `${this.userProfile.firstName} ${this.userProfile.lastName}` : '';
  }

  getCurrentProfilePicture(): string {
    return this.previewUrl || this.userProfile?.profilePic || 'https://via.placeholder.com/120';
  }

  getStatistics() {
    return this.userProfile
      ? { blogsCount: this.userProfile.postCount || 0, totalLikes: this.userProfile.likeCount || 0, totalComments: this.userProfile.commentCount || 0 }
      : { blogsCount: 0, totalLikes: 0, totalComments: 0 };
  }

  navigateToArticle(articleId: number): void {
    this.router.navigate(['/explore', articleId]);
  }

  // --- UI feedback ---
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
