import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ArticleService, Article, Comment, UserProfile } from '../../services/article.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { repopopComponent, ReportData } from '../../shared/components/reportpopup/repop.component';
import { ReportService } from '../../services/report.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-article',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, LoaderComponent, repopopComponent, RouterModule],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  article!: Article;
  currentUser: UserProfile | null = null;
  isLoading: boolean = true;
  error: string = '';
  isReported: boolean = false;
  
  // Report popup states
  showReportPopup: boolean = false;
  selectedPostId: string = '';
  reportType: 'GENERAL' | 'POST' | 'PROFILE' = 'POST';
  postTitle: string = '';

  // Interactive states
  isLiked: boolean = false;
  likesCount: number = 0;
  showComments: boolean = false;
  newComment: string = '';
  comments: Comment[] = [];
  isSubmittingComment: boolean = false;

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private reportService: ReportService, 
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Load user first
    this.loadCurrentUser();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.error = 'Invalid article ID';
      this.isLoading = false;
      return;
    }

    this.loadArticle(id);
  }

  loadArticle(id: number): void {
    this.isLoading = true;
    this.error = '';

    this.articleService.getArticleById(id).subscribe({
      next: (data) => {
        this.article = data;
        this.isLiked = data.isLiked;
        this.likesCount = data.likeCount;
        this.loadComments();
        this.isLoading = false;

        console.log("------------->>",this.article);
        
      },
      error: (err) => {
        console.error('❌ Error fetching article:', err);
        this.error = 'Failed to load article. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadCurrentUser(): void {
    this.articleService.getUserInfo().subscribe({
      next: (data) => {
        console.log('✅ User info:', data);
        this.currentUser = data;
      },
      error: (err) => {
        console.error('❌ Error fetching user info:', err);
        this.setDefaultUser();
      }
    });
  }

  setDefaultUser(): void {
    this.currentUser = {
      id: 0,
      firstName: 'Anonymous',
      lastName: 'User',
      profilePic: this.getDefaultAvatar(),
      bio: '',
      email: '',
      role: 'USER',
      postCount: 0,
      commentCount: 0,
      likeCount: 0,
      followersCount: 0,
      followingCount: 0
    };
  }

  getDefaultAvatar(): string {
    return 'https://i.pinimg.com/736x/e0/13/85/e0138502767289df0381f58f8de5aed9.jpg';
  }

  getDefaultBanner(): string {
    return '/assets/default-banner.jpg';
  }

  loadComments(): void {
    if (!this.article) return;
    
    this.articleService.getComments(this.article.id).subscribe({
      next: (data: Comment[]) => {
        this.comments = data;
      },
      error: (err) => {
        console.error('❌ Error fetching comments:', err);
      }
    });
  }

  onToggleComments(): void {
    this.showComments = !this.showComments;
  }

  onAddComment(): void {
    if (!this.newComment.trim() || !this.article || this.isSubmittingComment) return;
    
    // Validate comment length
    const trimmedComment = this.newComment.trim();
    if (trimmedComment.length < 5 || trimmedComment.length > 200) {
      this.displaySnackBar('Comment must be between 5 and 200 characters');
      return;
    }

    this.isSubmittingComment = true;

    this.articleService.addComment(this.article.id, trimmedComment).subscribe({
      next: (response: Comment) => {
        this.comments.unshift(response);
        this.newComment = '';
        this.isSubmittingComment = false;
        
        // Reset textarea height
        const textarea = document.querySelector('.comment-input') as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = 'auto';
        }
      },
      error: (err) => {
        console.error('❌ Error adding comment:', err);
        
        // Handle different error cases
        let errorMessage = 'Failed to add comment. Please try again.';
        if (err.status === 403) {
          errorMessage = 'You are not authorized to add comments. Please log in again.';
        } else if (err.status === 400) {
          errorMessage = err.error || 'Invalid comment data.';
        } else if (err.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        }
        
        this.displaySnackBar(errorMessage);
        this.isSubmittingComment = false;
      }
    });
  }

  onLikeComment(comment: Comment): void {
    this.articleService.likeComment(comment.id).subscribe({
      next: (updatedComment: Comment) => {
        // Find and update the comment in the array
        const index = this.comments.findIndex(c => c.id === comment.id);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
      },
      error: (err) => {
        console.error('❌ Error liking comment:', err);
        this.displaySnackBar('Failed to like comment. Please try again.');
      }
    });
  }

  onCommentInputChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    // Auto-resize textarea
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  onLikeArticle(): void {
    if (!this.article) return;

    this.articleService.likePost(this.article.id).subscribe({
      next: () => {
        // Toggle the like state
        this.isLiked = !this.isLiked;
        this.likesCount += this.isLiked ? 1 : -1;
        this.likesCount = Math.max(0, this.likesCount);
        
        // Update the article object
        this.article.isLiked = this.isLiked;
        this.article.likeCount = this.likesCount;
      },
      error: (err) => {
        console.error('❌ Error liking article:', err);
        this.displaySnackBar('Failed to like article. Please try again.');
      }
    });
  }

  onCancelComment(): void {
    this.newComment = '';
    const textarea = document.querySelector('.comment-input') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
    }
  }

  getFormattedDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Unknown date';
    }
  }

  getReadingTime(description: string): number {
    if (!description) return 1;
    const text = description.replace(/<[^>]*>/g, '');
    const wordCount = text.split(' ').filter(word => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  // Report functionality methods
  onReportArticle(): void {
    if (this.article && !this.isReported) {
      this.selectedPostId = this.article.id.toString();
      this.reportType = 'POST';
      this.postTitle = this.article.title.toString();
      this.showReportPopup = true;
    }
  }

handleReportSubmit(reportData: ReportData): void {
  this.reportService.submitReport(reportData).subscribe({
    next: () => {
      this.showReportPopup = false;
      this.isReported = true;
      this.showSuccessMessage('Thank you for your report. We will review it shortly.');
    },
    error: (err) => {
      console.error('Error submitting report:', err);
      this.showErrorMessage('Failed to submit report. Please try again.');
    }
  });
}


  handleReportCancel(): void {
    this.showReportPopup = false;
  }

  private showSuccessMessage(message: string): void {
    // You can replace this with a proper toast/snackbar component
    this.displaySnackBar(message);
  }

  private showErrorMessage(message: string): void {
    // You can replace this with a proper toast/snackbar component
    this.displaySnackBar(message);
  }

  getFullName(): string {
    if (!this.article) return 'Unknown Author';
    return `${this.article.firstName} ${this.article.lastName}`.trim() || 'Unknown Author';
  }

  capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getCurrentUserAvatar(): string {
    return this.currentUser?.profilePic || this.getDefaultAvatar();
  }

  getCurrentUserName(): string {
    if (!this.currentUser) return 'Anonymous User';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim() || 'Anonymous User';
  }

  getTimeAgo(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

      return this.getFormattedDate(dateString);
    } catch (error) {
      return 'Unknown time';
    }
  }

  getCharacterCount(): number {
    return this.newComment.length;
  }

  isCommentValid(): boolean {
    const trimmed = this.newComment.trim();
    return trimmed.length >= 5 && trimmed.length <= 200;
  }

  trackByCommentId(index: number, comment: Comment): number {
    return comment.id;
  }

  displaySnackBar(message : string) : void {
      this.snackBar.open(message, 'Close', {
      duration: 3000
    })
  }


  //   displayAlert() {
  //   this.snackBar.open('Report submitted successfully!', 'Close', {
  //     duration: 3000
  //   })
  // }

}