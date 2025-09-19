import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ArticleService, Article } from '../../services/article.service';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

interface CommentEntity {
  id: number;
  content: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    profilePic: string;
  };
}

interface CommentDto {
  id: number;
  content: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  profilePic: string;
}

type CommentResponse = CommentEntity | CommentDto;

interface CommentDisplay {
  id: number;
  content: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  author: string;
  avatar: string;
  isLiked: boolean;
  likes: number;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  profilePic: string;
}

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, LoaderComponent],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  article!: Article;
  currentUser: UserProfile | null = null;
  isLoading: boolean = true;
  error: string = '';

  // Interactive states
  isLiked: boolean = false;
  likesCount: number = 0;
  showComments: boolean = false;
  newComment: string = '';
  comments: CommentDisplay[] = [];
  isSubmittingComment: boolean = false;

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute
  ) {
    this.loadCurrentUser();
  }

  ngOnInit(): void {
      // ✅ fetch user first
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
        this.likesCount = Math.floor(Math.random() * 100) + 10; // Random likes for demo
        this.loadComments();
        this.isLoading = false;
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
      firstName: 'Anonymous',
      lastName: 'User',
      profilePic: this.getDefaultAvatar()
    };
  }

  getDefaultAvatar(): string {
    return 'https://i.pinimg.com/736x/e0/13/85/e0138502767289df0381f58f8de5aed9.jpg';
  }

  private normalizeComment(comment: CommentResponse): CommentDisplay {
    if ('user' in comment) {
      // CommentEntity
      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
        profilePic: comment.user.profilePic || this.getDefaultAvatar(),
        author: `${comment.user.firstName} ${comment.user.lastName}`.trim(),
        avatar: comment.user.profilePic || this.getDefaultAvatar(),
        isLiked: false,
        likes: Math.floor(Math.random() * 15) + 1
      };
    } else {
      // CommentDto
      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        firstName: comment.firstName,
        lastName: comment.lastName,
        profilePic: comment.profilePic || this.getDefaultAvatar(),
        author: `${comment.firstName} ${comment.lastName}`.trim(),
        avatar: comment.profilePic || this.getDefaultAvatar(),
        isLiked: false,
        likes: Math.floor(Math.random() * 15) + 1
      };
    }
  }

  loadComments(): void {
    if (!this.article) return;
    
    this.articleService.getComments(this.article.id).subscribe({
      next: (data: CommentResponse[]) => {
        this.comments = data.map(c => this.normalizeComment(c));
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
      alert('Comment must be between 5 and 200 characters');
      return;
    }

    this.isSubmittingComment = true;

    this.articleService.addComment(this.article.id, trimmedComment).subscribe({
      next: (response: CommentResponse) => {
        const newCommentDisplay = this.normalizeComment(response);
        this.comments.unshift(newCommentDisplay);
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
        
        alert(errorMessage);
        this.isSubmittingComment = false;
      }
    });
  }

  onLikeComment(comment: CommentDisplay): void {
    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;
    comment.likes = Math.max(0, comment.likes); // Prevent negative likes
  }

  onCommentInputChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    // Auto-resize textarea
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  onLikeArticle(): void {
    this.isLiked = !this.isLiked;
    this.likesCount += this.isLiked ? 1 : -1;
    this.likesCount = Math.max(0, this.likesCount); // Prevent negative likes
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

  onReportArticle(): void {
    if (confirm('Are you sure you want to report this article?')) {
      console.log('Article reported:', this.article.id);
      alert('Article has been reported. Thank you for your feedback.');
    }
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

  trackByCommentId(index: number, comment: CommentDisplay): number {
    return comment.id;
  }
}
