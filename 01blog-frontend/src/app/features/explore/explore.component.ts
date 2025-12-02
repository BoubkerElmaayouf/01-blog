import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';

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
export class ExploreComponent implements OnInit, OnDestroy {
  selectedCategory = 'Tech';
  categories = ['Tech', 'Education', 'Products', 'SaaS', 'Gaming'];
  
  isLoading: boolean = true;
  isLoadingMore: boolean = false;
  hasMorePages: boolean = true;
  currentPage: number = 0;
  pageSize: number = 10;

  posts: Post[] = [];
  filteredPosts: Post[] = [];

  private destroy$ = new Subject<void>();
  private scrollThreshold = 100; // pixels from bottom

  constructor(
    private articleService: ArticleService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetchInitialPosts();
    this.setupScrollListener();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupScrollListener() {
    // Use setInterval to manually check scroll position
    const scrollCheckInterval = setInterval(() => {
      if (this.destroy$) {
        this.onScroll();
      }
    }, 200);

    // Clean up interval on destroy
    this.destroy$.subscribe(() => {
      clearInterval(scrollCheckInterval);
    });
  }

  onScroll() {
    if (this.isLoading) {
      return;
    }

    // Get scroll information from multiple sources
    const html = document.documentElement;
    const body = document.body;
    
    const scrollTop = window.pageYOffset || html.scrollTop || body.scrollTop || 0;
    const scrollHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    const clientHeight = window.innerHeight || html.clientHeight;
    
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // console.log('Scrolling....', { scrollTop, scrollHeight, clientHeight, distanceFromBottom });

    // Trigger load when within threshold of bottom
    if (distanceFromBottom < this.scrollThreshold && !this.isLoadingMore && this.hasMorePages) {
      // console.log('Infinite scroll triggered - Distance from bottom:', distanceFromBottom);
      this.fetchMorePosts();
    }
  }

  fetchInitialPosts() {
    this.isLoading = true;
    this.currentPage = 0;
    this.posts = [];
    this.filteredPosts = [];
    
    this.articleService.getAllPosts(0, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.posts = response.content.map(article => ({
            ...article,
            likes: article.likeCount,
            comments: article.commentCount,
            saves: Math.floor(Math.random() * 100) + 5,
            isSaved: Math.random() > 0.8
          }));
          
          this.hasMorePages = response.hasNext;
          this.currentPage = response.currentPage + 1;
          
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

  fetchMorePosts() {
    if (this.isLoadingMore || !this.hasMorePages) {
      return;
    }

    this.isLoadingMore = true;

    this.articleService.getAllPosts(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const newPosts = response.content.map(article => ({
            ...article,
            likes: article.likeCount,
            comments: article.commentCount,
            saves: Math.floor(Math.random() * 100) + 5,
            isSaved: Math.random() > 0.8
          }));

          // Get current scroll height before adding new items
          const scrollHeightBefore = document.documentElement.scrollHeight;

          // Append new posts
          this.posts = [...this.posts, ...newPosts];
          this.hasMorePages = response.hasNext;
          this.currentPage = response.currentPage + 1;

          // Filter posts and trigger change detection
          this.filterPosts();

          // Maintain scroll position
          setTimeout(() => {
            const scrollHeightAfter = document.documentElement.scrollHeight;
            const heightDifference = scrollHeightAfter - scrollHeightBefore;
            window.scrollBy(0, heightDifference);
          }, 0);

          this.isLoadingMore = false;
          // console.log('Loaded more posts:', newPosts.length, 'Total:', this.posts.length);
        },
        error: (err) => {
          console.error('Error loading more posts:', err);
          this.isLoadingMore = false;
          this.snackBar.open('Error loading more posts', 'Close', { duration: 3000 });
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
        
        // console.log('Liked post:', post.title, 'Total likes:', post.likeCount);
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
    
    // console.log('Saved post:', post.title, 'Total saves:', post.saves);
  }

  onComment(post: Post, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/explore', post.id]);
  }

  onReport(post: Post) {
    // console.log('Report post:', post.title);
    this.snackBar.open('Post reported', '', { duration: 2000 });
  }

  onUpdate(post: Post) {
    // console.log('Update post:', post.title);
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
        this.snackBar.open('❌ You are not allowed to delete this post', '', { 
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onPostClick(post: Post) {
    this.router.navigate(['/explore', post.id]);
    // console.log('Navigate to post:', post.id);
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