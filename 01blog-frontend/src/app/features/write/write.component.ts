import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";
import { ImageUploadService } from "../../utils/image-upload.service";
import { jwtDecode } from 'jwt-decode';

declare var Quill: any;

@Component({
  selector: 'app-write',
  standalone: true,
  imports: [
    RouterModule,
    NavbarComponent,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSnackBarModule,
  ],
  templateUrl: "./write.component.html",
  styleUrls: ['./write.component.css'],
})
export class WriteComponent implements OnInit, AfterViewInit {
  @ViewChild('editor', { static: false }) editorElement!: ElementRef;

  postForm: FormGroup;
  quillEditor: any;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isPublishing: boolean = false;

  postId: string | null = null;
  isEditMode: boolean = false;
  private pendingPostData: any = null;
  currentUserId: number | null = null;

  // File validation limits for Cloudinary free tier
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
  private readonly MAX_CONTENT_MEDIA = 5; // Maximum 5 images/videos in content

  // Track content media count
  private contentMediaCount = 0;

  categories = [
    { value: 'tech', label: 'Technology' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'products', label: 'Products' },
    { value: 'education', label: 'Education' },
    { value: 'saas', label: 'SaaS' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private imageUploadService: ImageUploadService
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      banner: [''],
      category: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.currentUserId = decoded.id || decoded.userId || decoded.sub || null;
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }

    this.postId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.postId;
    if (this.isEditMode) this.loadPostData(this.postId!);

    if (typeof Quill === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
      script.onload = () => this.initQuill();
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }

  ngAfterViewInit(): void {
    if (typeof Quill !== 'undefined') {
      this.initQuill();
    }
  }

  // File validation method
  private validateFile(file: File): string | null {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    // Check if file is image or video
    if (!isImage && !isVideo) {
      return 'Only images and videos are allowed';
    }

    // Check format
    if (isImage && !this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Invalid image format. Use JPG, PNG, GIF, or WebP';
    }

    if (isVideo && !this.ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return 'Invalid video format. Use MP4 or WebM';
    }

    // Check size
    const maxSize = isVideo ? this.MAX_VIDEO_SIZE : this.MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return `File too large. Maximum size: ${maxMB}MB`;
    }

    return null; // Valid file
  }

  // Count current media in editor
  private countEditorMedia(): number {
    if (!this.quillEditor) return 0;
    const images = this.quillEditor.root.querySelectorAll('img').length;
    const videos = this.quillEditor.root.querySelectorAll('video').length;
    return images + videos;
  }

  private initQuill(): void {
    setTimeout(() => {
      if (this.editorElement) {

        const BlockEmbed = Quill.import('blots/block/embed');
        class LocalVideoBlot extends BlockEmbed {
          static blotName = 'video';
          static tagName = 'video';
          static className = 'quill-local-video';

          static create(value: string) {
            const node = super.create() as HTMLVideoElement;
            node.setAttribute('controls', '');
            node.setAttribute('src', value);
            return node;
          }

          static value(node: HTMLVideoElement) {
            return node.getAttribute('src');
          }
        }
        Quill.register(LocalVideoBlot, true);

        this.quillEditor = new Quill(this.editorElement.nativeElement, {
          theme: 'snow',
          placeholder: 'Write your blog post content here...',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'script': 'sub' }, { 'script': 'super' }],
              [{ 'indent': '-1' }, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'font': [] }],
              [{ 'align': [] }],
              ['clean'],
              ['link', 'image', 'video'],
            ],
          },
        });

        this.quillEditor.on('text-change', () => {
          const content = this.quillEditor.root.innerHTML;
          this.postForm.get('content')?.setValue(content);
        });

        // Custom image handler
        const toolbar = this.quillEditor.getModule('toolbar');
        toolbar.addHandler('image', () => {
          const currentCount = this.countEditorMedia();
          
          if (currentCount >= this.MAX_CONTENT_MEDIA) {
            this.snackBar.open(`Maximum ${this.MAX_CONTENT_MEDIA} images/videos allowed in content`, 'Close', { duration: 4000 });
            return;
          }

          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            // Validate image file
            const error = this.validateFile(file);
            if (error) {
              this.snackBar.open(error, 'Close', { duration: 4000 });
              return;
            }

            // Show local preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
              const range = this.quillEditor.getSelection(true);
              this.quillEditor.insertEmbed(range.index, 'image', e.target.result, 'user');
            };
            reader.readAsDataURL(file);
          };
        });

        // Custom video handler
        toolbar.addHandler('video', () => {
          const currentCount = this.countEditorMedia();
          
          if (currentCount >= this.MAX_CONTENT_MEDIA) {
            this.snackBar.open(`Maximum ${this.MAX_CONTENT_MEDIA} images/videos allowed in content`, 'Close', { duration: 4000 });
            return;
          }

          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'video/*');
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            // Validate video file
            const error = this.validateFile(file);
            if (error) {
              this.snackBar.open(error, 'Close', { duration: 4000 });
              return;
            }

            // Show local preview
            const localUrl = URL.createObjectURL(file);
            const range = this.quillEditor.getSelection(true);
            this.quillEditor.insertEmbed(range.index, 'video', localUrl, 'user');
          };
        });

        if (this.pendingPostData) {
          this.quillEditor.root.innerHTML = this.pendingPostData.description;
          this.pendingPostData = null;
        }
      }
    }, 100);
  }

  private async loadPostData(id: string) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      const post: any = await this.http.get(`http://localhost:8080/api/post/${id}`, { headers }).toPromise();

      if (this.currentUserId && post.userId !== this.currentUserId) {
        this.snackBar.open('You are not allowed to edit this post.', 'Close', { duration: 3000 });
        this.router.navigate(['/']);
        return;
      }

      this.postForm.patchValue({
        title: post.title,
        category: post.topic,
        banner: post.banner,
        content: post.description,
      });

      this.imagePreview = post.banner;
      if (!this.quillEditor) this.pendingPostData = post;
      else this.quillEditor.root.innerHTML = post.description;

    } catch (error: any) {
      console.error('Error loading post:', error);
      this.snackBar.open('Failed to load post', 'Close', { duration: 3000 });
    }
  }

  onFileSelected(event: Event, fileInput: HTMLInputElement): void {
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      // Validate banner file
      const error = this.validateFile(file);
      if (error) {
        this.snackBar.open(error, 'Close', { duration: 4000 });
        fileInput.value = ''; // Clear input
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => { this.imagePreview = e.target.result; };
      reader.readAsDataURL(this.selectedFile);

      this.postForm.get('banner')?.setValue(this.selectedFile.name);
    }
  }

  removeImage(fileInput: HTMLInputElement): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.postForm.get('banner')?.setValue('');
    fileInput.value = '';
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  private async extractAndUploadMediaFromContent(content: string): Promise<string> {
    const doc = document.createElement('div');
    doc.innerHTML = content;

    // Count total media first
    const images = doc.querySelectorAll('img');
    const videos = doc.querySelectorAll('video');
    const totalMedia = images.length + videos.length;

    if (totalMedia === 0) {
      return doc.innerHTML; // No media to process
    }

    if (totalMedia > this.MAX_CONTENT_MEDIA) {
      throw new Error(`You can only upload maximum ${this.MAX_CONTENT_MEDIA} images/videos in content. You have ${totalMedia}.`);
    }

    const uploadMedia = async (element: HTMLImageElement | HTMLVideoElement, srcAttr = 'src') => {
      const src = element.getAttribute(srcAttr);
      if (!src) return;

      if (src.startsWith('http') || src.startsWith('https://res.cloudinary.com')) return;

      try {
        const response = await fetch(src);
        const blob = await response.blob();
        const ext = blob.type.startsWith('video/') ? 'mp4' : 'png';
        const file = new File([blob], `content-media.${ext}`, { type: blob.type });

        // Validate before uploading
        const error = this.validateFile(file);
        if (error) {
          throw new Error(error);
        }

        const uploaded = await this.imageUploadService.uploadImage(file);
        element.setAttribute(srcAttr, uploaded.secure_url);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to upload media');
      }
    };

    // Upload images
    for (const img of Array.from(images)) {
      await uploadMedia(img);
    }

    // Upload videos
    for (const video of Array.from(videos)) {
      await uploadMedia(video);
    }

    return doc.innerHTML;
  }

  async onPublish(): Promise<void> {
    if (!this.postForm.valid) {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isPublishing = true;
    this.disableFormControls(true);

    try {
      let bannerUrl = { secure_url: '', public_id: '', resourceType: 'image' as 'image' | 'video' };
      let processedContent = this.quillEditor?.root.innerHTML || '';

      if (this.selectedFile) {
        this.snackBar.open('Uploading banner image...', '', { duration: 2000 });
        bannerUrl = await this.imageUploadService.uploadImage(this.selectedFile);
      }

      this.snackBar.open('Processing content media...', '', { duration: 2000 });
      processedContent = await this.extractAndUploadMediaFromContent(processedContent);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const postData = {
        title: this.postForm.get('title')?.value,
        topic: this.postForm.get('category')?.value,
        banner: bannerUrl.secure_url || this.postForm.get('banner')?.value || "https://res.cloudinary.com/dsv24pun2/image/upload/v1765794242/posts/xszrq1xlnpix1tdjeven.png",
        description: processedContent && processedContent.length > 10 ? processedContent : "<p>No description provided</p>",
        videos: []
      };

      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

      const url = this.isEditMode
        ? `http://localhost:8080/api/post/edit/${this.postId}`
        : 'http://localhost:8080/api/post/create';

      const method = this.isEditMode ? 'patch' : 'post';

      this.snackBar.open(this.isEditMode ? 'Updating post...' : 'Publishing post...', '', { duration: 2000 });
      await this.http.request(method, url, { body: postData, headers }).toPromise().then((response: any) => {
        this.snackBar.open(this.isEditMode ? 'Post updated successfully!' : 'Post published successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/explore']);
      },
        (error: any) => {
          this.snackBar.open(error.error, 'Close', { duration: 4000 });
        }
      )

    } catch (error: any) {
      console.error('Error publishing post:', error);
      this.snackBar.open(error.message || 'Failed to publish post', 'Close', { duration: 4000 });
    } finally {
      this.isPublishing = false;
      this.disableFormControls(false);
    }
  }

  private disableFormControls(disable: boolean): void {
    const controls = ['title', 'category', 'banner', 'content'];
    controls.forEach(controlName => {
      const control = this.postForm.get(controlName);
      if (control) {
        if (disable) {
          control.disable({ emitEvent: false });
        } else {
          control.enable({ emitEvent: false });
        }
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.postForm.controls).forEach(key => {
      this.postForm.get(key)?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.postForm.get(fieldName);
    if (control?.hasError('required')) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    if (control?.hasError('minlength')) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 3 characters long`;
    return '';
  }
}