import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

interface Article {
  id: number;
  title: string;
  topic: string;
  banner: string;
  description: string;
  videos: any[];
  createdAt: string;
  firstName: string;
  lastName: string;
  profilePic: string;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

@Component({
  selector: 'app-article',
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  article: Article = {
    id: 1,
    title: "this is my first post",
    topic: "technology",
    banner: "https://res.cloudinary.com/dsv24pun2/image/upload/v1758050040/rjiott3w7fflfwgr4gjw.jpg",
    description: "<h1>heeader </h1><p><br></p><p class=\"ql-align-center\"><img src=\"https://res.cloudinary.com/dsv24pun2/image/upload/v1758050040/gbb1ed8u7trpdqcec5wn.jpg\"></p><p class=\"ql-align-center\"><br></p><p class=\"ql-align-center\"><strong>this is what this is </strong></p>",
    videos: [],
    createdAt: "2025-09-16T20:14:01.312701",
    firstName: "d",
    lastName: "d",
    profilePic: "https://res.cloudinary.com/dsv24pun2/image/upload/v1758049984/ic4lp85bbjom7fhqhdsy.jpg"
  };

  // Interactive states
  isLiked: boolean = false;
  likesCount: number = 42;
  showComments: boolean = false;
  newComment: string = '';
  comments: Comment[] = [
    {
      id: 1,
      author: "John Smith",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
      content: "Great article! Really enjoyed reading about this topic. The insights you've shared are very valuable.",
      createdAt: "2025-09-16T18:30:00.000Z",
      likes: 5,
      isLiked: false
    },
    {
      id: 2,
      author: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
      content: "I had a different perspective on this before reading your post. Thanks for sharing!",
      createdAt: "2025-09-16T19:45:00.000Z",
      likes: 3,
      isLiked: true
    },
    {
      id: 3,
      author: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      content: "Would love to see more content like this. Keep up the excellent work!",
      createdAt: "2025-09-16T20:10:00.000Z",
      likes: 8,
      isLiked: false
    }
  ];

  ngOnInit(): void {
    // In a real app, you would fetch the article data from a service here
    // this.articleService.getArticle(id).subscribe(article => this.article = article);
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  getReadingTime(description: string): number {
    // Remove HTML tags and calculate reading time (average 200 words per minute)
    const text = description.replace(/<[^>]*>/g, '');
    const wordCount = text.split(' ').length;
    return Math.ceil(wordCount / 200);
  }

  onReportArticle(): void {
    console.log('Article reported:', this.article.id);
    // In a real app, you might show a snackbar or modal here
    alert('Article has been reported. Thank you for your feedback.');
  }

  getFullName(): string {
    return `${this.article.firstName} ${this.article.lastName}`;
  }

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Interactive methods
  onLikeArticle(): void {
    this.isLiked = !this.isLiked;
    this.likesCount += this.isLiked ? 1 : -1;
  }

  onToggleComments(): void {
    this.showComments = !this.showComments;
  }

  onAddComment(): void {
    if (this.newComment.trim()) {
      const comment: Comment = {
        id: this.comments.length + 1,
        author: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face",
        content: this.newComment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };
      this.comments.unshift(comment);
      this.newComment = '';
    }
  }

  onLikeComment(comment: Comment): void {
    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;
  }

  onShareArticle(): void {
    // Check if Web Share API is available and supported
    if (navigator.share && this.canUseWebShare()) {
      navigator.share({
        title: this.article.title,
        text: 'Check out this interesting article!',
        url: window.location.href
      }).catch(err => {
        console.log('Web Share API failed:', err);
        this.fallbackShare();
      });
    } else {
      this.fallbackShare();
    }
  }

  private canUseWebShare(): boolean {
    // Web Share API requires HTTPS or localhost
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  private fallbackShare(): void {
    // Try clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          console.log
          ('✅ Article link copied to clipboard!');
        })
        .catch(() => {
          this.showShareModal();
        });
    } else {
      // If clipboard API not available, show share modal
      this.showShareModal();
    }
  }

  private showShareModal(): void {
    const currentUrl = window.location.href;
    const articleTitle = encodeURIComponent(this.article.title);
    const shareText = encodeURIComponent('Check out this article: ' + this.article.title);
    
    const shareOptions = [
      {
        name: '🐦 Twitter',
        url: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(currentUrl)}`
      },
      {
        name: '📘 Facebook', 
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
      },
      {
        name: '💼 LinkedIn',
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
      },
      {
        name: '📧 Email',
        url: `mailto:?subject=${articleTitle}&body=I thought you might find this article interesting: ${encodeURIComponent(currentUrl)}`
      }
    ];

    // Create a simple modal-like experience
    const choice = confirm(
      `Share this article!\n\nClick OK to copy the link to clipboard, or Cancel to see sharing options.`
    );

    if (choice) {
      // Try to copy link manually
      this.copyToClipboardFallback(currentUrl);
    } else {
      // Show sharing options
      let message = 'Choose how to share:\n\n';
      shareOptions.forEach((option, index) => {
        message += `${index + 1}. ${option.name}\n`;
      });
      
      const selection = prompt(message + '\nEnter the number of your choice (1-4):');
      const selectedIndex = parseInt(selection || '0') - 1;
      
      if (selectedIndex >= 0 && selectedIndex < shareOptions.length) {
        window.open(shareOptions[selectedIndex].url, '_blank', 'width=600,height=400');
      }
    }
  }

  private copyToClipboardFallback(text: string): void {
    // Fallback method for copying to clipboard
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('✅ Article link copied to clipboard!');
      } else {
        alert(`📋 Copy this link manually:\n\n${text}`);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      alert(`📋 Copy this link manually:\n\n${text}`);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return this.getFormattedDate(dateString);
  }
}