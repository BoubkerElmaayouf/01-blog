import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ArticleService, Article } from '../../services/article.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-component';

interface Post extends Article {
  likes?: number;
  comments?: number;
  saves?: number;
  isSaved?: boolean;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
  imports: [
    NavbarComponent,
    CommonModule,
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatSnackBarModule,
    LoaderComponent,
    MatDialogModule,
  ]
})
export class ExploreComponent implements OnInit {
  selectedCategory = 'Tech';
  categories = ['Tech', 'Education', 'Products', 'SaaS', 'Gaming'];
  isLoading: boolean = true;

  posts: Post[] = [];
  filteredPosts: Post[] = [];

  constructor(
    private articleService: ArticleService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetchPosts();
  }

  fetchPosts() {
    this.articleService.getAllPosts()
      .subscribe({
        next: (data) => {
          this.posts = data.map(article => ({
            ...article,
            likes: article.likeCount,
            comments: article.commentCount,
            saves: Math.floor(Math.random() * 100) + 5,
            isSaved: Math.random() > 0.8
          }));
          console.log('Fetched posts:', this.posts);
          this.isLoading = false;
          this.filterPosts();
        },
        error: (err) => {
          console.error('Error fetching posts:', err);
          this.isLoading = false;
          this.snackBar.open('Error loading posts', 'Close', { duration: 3000 });
        }
      });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterPosts();
  }

  filterPosts() {
    this.filteredPosts = this.posts.filter(
      post => post.topic.toLowerCase() === this.selectedCategory.toLowerCase()
    );
  }

  onLike(post: Post, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.articleService.likePost(post.id).subscribe({
      next: (response) => {
        post.isLiked = !post.isLiked;
        
        if (post.isLiked) {
          post.likeCount = (post.likeCount || 0) + 1;
        } else {
          post.likeCount = Math.max((post.likeCount || 0) - 1, 0);
        }
        
        post.likes = post.likeCount;
        
        console.log('Liked post:', post.title, 'Total likes:', post.likeCount);
      },
      error: (err) => {
        console.error('Error liking post:', err);
        this.snackBar.open('Error updating like', 'Close', { duration: 2000 });
      }
    });
  }

  onSave(post: Post, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (post.isSaved) {
      post.saves = (post.saves || 0) - 1;
      post.isSaved = false;
      this.snackBar.open('Removed from saved posts', '', { duration: 2000 });
    } else {
      post.saves = (post.saves || 0) + 1;
      post.isSaved = true;
      this.snackBar.open('Post saved!', '', { duration: 2000 });
    }
    
    console.log('Saved post:', post.title, 'Total saves:', post.saves);
  }

  onComment(post: Post, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Navigate to comments for post:', post.title);
    this.router.navigate(['/explore', post.id]);
  }

  onReport(post: Post) {
    console.log('Report post:', post.title);
    this.snackBar.open('Post reported', '', { duration: 2000 });
  }

  onUpdate(post: Post) {
    console.log('Update post:', post.title);
    this.router.navigate(['/edit-post', post.id]);
  }

  openDeleteDialog(post: Post, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: `Are you sure you want to delete "${post.title}"?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onDelete(post);
      }
    });
  }

  onDelete(post: Post) {
    this.articleService.deletePost(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== post.id);
        this.filteredPosts = this.filteredPosts.filter(p => p.id !== post.id);
        
        this.snackBar.open('✅ Post deleted successfully', '', { 
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        this.snackBar.open('❌ Failed to delete post', '', { 
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onPostClick(post: Post) {
    this.router.navigate(['/explore', post.id]);
    console.log('Navigate to post:', post.id);
  }

  formatCount(count: number = 0): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }

  trackByPostId(index: number, post: Post): number {
    return post.id;
  }
}