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
import { ArticleService, Article } from '../../services/article.service'; // Import your service

interface Post extends Article {
  // Add any additional properties you need for the UI that aren't in Article
  likes?: number;  // For backward compatibility
  comments?: number;  // For backward compatibility
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
    LoaderComponent
  ]
})
export class ExploreComponent implements OnInit {
  selectedCategory = 'Tech';
  categories = ['Tech', 'Education', 'Products', 'SaaS', 'Gaming'];
  isLoading: boolean = true;

  posts: Post[] = [];
  filteredPosts: Post[] = [];

  constructor(
    private articleService: ArticleService, // Use the service instead of HttpClient directly
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchPosts();
  }

  fetchPosts() {
    this.articleService.getAllPosts()
      .subscribe({
        next: (data) => {
          // Map Article to Post interface and add UI-specific properties
          this.posts = data.map(article => ({
            ...article,
            // Keep the original API fields and add UI-specific properties
            likes: article.likeCount, // For backward compatibility with template
            comments: article.commentCount, // For backward compatibility with template
            saves: Math.floor(Math.random() * 100) + 5, // Mock saves data
            isSaved: Math.random() > 0.8 // Mock saved status
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
    
    // Call the service to like/unlike the post
    this.articleService.likePost(post.id).subscribe({
      next: (response) => {
        // Toggle the like status
        post.isLiked = !post.isLiked;
        
        // Update the like count based on the new status
        if (post.isLiked) {
          post.likeCount = (post.likeCount || 0) + 1;
        } else {
          post.likeCount = Math.max((post.likeCount || 0) - 1, 0);
        }
        
        // Also update the likes property for display
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
    
    // Since there's no save endpoint in your service, keep the mock behavior
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
    // Navigate to post detail page with comments section
    this.router.navigate(['/explore', post.id]);
  }

  onReport(post: Post) {
    console.log('Report post:', post.title);
    this.snackBar.open('Post reported', '', { duration: 2000 });
  }

  onUpdate(post: Post) {
    console.log('Update post:', post.title);
    // Navigate to edit post page
    this.router.navigate(['/edit-post', post.id]);
  }

  onDelete(post: Post) {
    console.log('Delete post:', post.title);
    // Show confirmation dialog and delete
    // You'll need to add a delete method to your ArticleService
    this.snackBar.open('Post deleted', '', { duration: 2000 });
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
}