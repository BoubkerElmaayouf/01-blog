import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ArticleService, Article, Comment } from '../../services/article.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-article',
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  article!: Article;

  // Interactive states
  isLiked: boolean = false;
  likesCount: number = 0;
  showComments: boolean = false;
  newComment: string = '';
  comments: Comment[] = [];

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')) || 1;

    // Fetch article
    this.articleService.getArticleById(id).subscribe({
      next: (data) => {
        this.article = data;
        this.likesCount = 42; // set initial likes or fetch from API
        this.loadComments();
      },
      error: (err) => {
        console.error('❌ Error fetching article:', err);
      }
    });
  }

  loadComments(): void {
    if (!this.article) return;
    this.articleService.getComments(this.article.id).subscribe({
      next: (data) => {
        this.comments = data;
      },
      error: (err) => console.error('❌ Error fetching comments:', err)
    });
  }

  onToggleComments(): void {
    this.showComments = !this.showComments;
  }

  onAddComment(): void {
    if (!this.newComment.trim() || !this.article) return;

    this.articleService.addComment(this.article.id, this.newComment.trim()).subscribe({
      next: (comment) => {
        this.comments.unshift(comment); // add new comment on top
        this.newComment = '';
      },
      error: (err) => console.error('❌ Error adding comment:', err)
    });
  }

  onLikeComment(comment: Comment): void {
    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;
  }

  onLikeArticle(): void {
    this.isLiked = !this.isLiked;
    this.likesCount += this.isLiked ? 1 : -1;
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  getReadingTime(description: string): number {
    const text = description.replace(/<[^>]*>/g, '');
    const wordCount = text.split(' ').filter(Boolean).length;
    return Math.ceil(wordCount / 200);
  }

  onReportArticle(): void {
    console.log('Article reported:', this.article.id);
    alert('Article has been reported. Thank you for your feedback.');
  }

  getFullName(): string {
    return `${this.article.firstName} ${this.article.lastName}`;
  }

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  onShareArticle(): void {
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
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  private fallbackShare(): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => console.log('✅ Article link copied to clipboard!'))
        .catch(() => this.showShareModal());
    } else {
      this.showShareModal();
    }
  }

  private showShareModal(): void {
    const currentUrl = window.location.href;
    const articleTitle = encodeURIComponent(this.article.title);
    const shareText = encodeURIComponent('Check out this article: ' + this.article.title);

    const shareOptions = [
      { name: '🐦 Twitter', url: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(currentUrl)}` },
      { name: '📘 Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}` },
      { name: '💼 LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}` },
      { name: '📧 Email', url: `mailto:?subject=${articleTitle}&body=I thought you might find this article interesting: ${encodeURIComponent(currentUrl)}` }
    ];

    const choice = confirm(`Share this article!\n\nClick OK to copy the link to clipboard, or Cancel to see sharing options.`);

    if (choice) {
      this.copyToClipboardFallback(currentUrl);
    } else {
      let message = 'Choose how to share:\n\n';
      shareOptions.forEach((option, index) => message += `${index + 1}. ${option.name}\n`);
      
      const selection = prompt(message + '\nEnter the number of your choice (1-4):');
      const selectedIndex = parseInt(selection || '0') - 1;

      if (selectedIndex >= 0 && selectedIndex < shareOptions.length) {
        window.open(shareOptions[selectedIndex].url, '_blank', 'width=600,height=400');
      }
    }
  }

  private copyToClipboardFallback(text: string): void {
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
      if (successful) alert('✅ Article link copied to clipboard!');
      else alert(`📋 Copy this link manually:\n\n${text}`);
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
