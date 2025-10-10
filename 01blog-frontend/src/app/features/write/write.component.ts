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
import { LoaderComponent } from "../../shared/components/loader/loader.component";
import { jwtDecode } from 'jwt-decode';


// Quill imports
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
        LoaderComponent
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
    isLoading: boolean = true;

    postId: string | null = null;
    isEditMode: boolean = false

    private pendingPostData: any = null;
    currentUserId: number | null = null;

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
            title: ['', [Validators.required, Validators.minLength(3)]],
            banner: [''],
            category: ['', Validators.required],
            content: ['', Validators.required]
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
        if (this.isEditMode) {
            this.loadPostData(this.postId!);
        }

        this.isLoading = true;
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

private initQuill(): void {
  setTimeout(() => {
    if (this.editorElement) {
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
            ['link', 'image'],
            ['video'],
          ],
        },
      });

      // Update the form when Quill content changes
      this.quillEditor.on('text-change', () => {
        const content = this.quillEditor.root.innerHTML;
        this.postForm.get('content')?.setValue(content);
      });

      // ✅ If we already fetched post data before Quill was ready
      if (this.pendingPostData) {
        this.quillEditor.root.innerHTML = this.pendingPostData.description;
        this.pendingPostData = null;
      }
    }
  }, 100);

  this.isLoading = false;
}


    private async loadPostData(id: string) {
    try {
        this.isLoading = true;
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
        const post: any = await this.http.get(`http://localhost:8080/api/post/${id}`, { headers }).toPromise();

        // Check if the current user is the owner
        console.log(this.currentUserId , post.id);
        
        if (this.currentUserId && post.userId !== this.currentUserId) {
            this.snackBar.open('You are not allowed to edit this post.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
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

        if (!this.quillEditor) {
        this.pendingPostData = post;
        } else {
        this.quillEditor.root.innerHTML = post.description;
        }

    } catch (error: any) {
        console.error('Error loading post:', error);
        this.snackBar.open('Failed to load post', 'Close', { duration: 3000 });
    } finally {
        this.isLoading = false;
    }
    }



    onFileSelected(event: Event, fileInput: HTMLInputElement): void {
        if (fileInput.files && fileInput.files.length > 0) {
            this.selectedFile = fileInput.files[0];

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

    private async extractAndUploadImagesFromContent(content: string): Promise<string> {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const images = doc.querySelectorAll('img');

        for (const img of Array.from(images)) {
            const src = img.getAttribute('src');
            if (!src || src.startsWith('http') || src.startsWith('https://res.cloudinary.com')) continue;

            if (src.startsWith('data:image')) {
                try {
                    const response = await fetch(src);
                    const blob = await response.blob();
                    const file = new File([blob], 'content-image.png', { type: blob.type });
                    const uploaded = await this.imageUploadService.uploadImage(file);
                    img.setAttribute('src', uploaded.secure_url);
                } catch (error) {
                    console.error('Error uploading content image:', error);
                }
            }
        }

        return doc.documentElement.outerHTML;
    }

    async onPublish(): Promise<void> {
    if (!this.postForm.valid) {
        this.markFormGroupTouched();
        this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
        return;
    }

    this.isPublishing = true;

    try {
        let bannerUrl = { secure_url: '', public_id: '', resourceType: 'image' as 'image' | 'video' };
        let processedContent = this.quillEditor?.root.innerHTML || '';

        // Upload banner if selected
        if (this.selectedFile) {
            this.snackBar.open('Uploading banner image...', '', { duration: 2000 });
            bannerUrl = await this.imageUploadService.uploadImage(this.selectedFile);
        }

        // Upload images inside content
        this.snackBar.open('Processing content images...', '', { duration: 2000 });
        processedContent = await this.extractAndUploadImagesFromContent(processedContent);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found. Please log in again.');

        const postData = {
            title: this.postForm.get('title')?.value,
            topic: this.postForm.get('category')?.value,
            banner: bannerUrl.secure_url || this.postForm.get('banner')?.value || "https://res.cloudinary.com/dsv24pun2/image/upload/v1759512402/rw8cum1ojxkel1gaeqij.png",
            description: processedContent && processedContent.length > 20 ? processedContent : "<p>No description provided</p>",
            videos: []
        };

        const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

        const url = this.isEditMode
            ? `http://localhost:8080/api/post/edit/${this.postId}`
            : 'http://localhost:8080/api/post/create';
        const method = this.isEditMode ? 'patch' : 'post';

        this.snackBar.open(this.isEditMode ? 'Updating post...' : 'Publishing post...', '', { duration: 2000 });

        await this.http.request(method, url, { body: postData, headers }).toPromise();

        this.snackBar.open(this.isEditMode ? 'Post updated successfully!' : 'Post published successfully!', 'Close', { duration: 3000 });

        // Reset form only for new post
        if (!this.isEditMode) {
            this.postForm.reset();
            this.selectedFile = null;
            this.imagePreview = null;
            if (this.quillEditor) this.quillEditor.setContents([]);
        } else {
            // Optionally, navigate back to the post view page
            this.router.navigate(['/post', this.postId]);
        }

    } catch (error: any) {
        console.error('Error publishing post:', error);
        const errorMsg = error.error || error.message || 'Failed to publish post. Please try again.';
        this.snackBar.open(errorMsg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
    } finally {
        this.isPublishing = false;
    }
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
