import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";

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
        MatToolbarModule
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
    
    categories = [
        { value: 'technology', label: 'Technology' },
        { value: 'lifestyle', label: 'Lifestyle' },
        { value: 'travel', label: 'Travel' },
        { value: 'food', label: 'Food' },
        { value: 'business', label: 'Business' },
        { value: 'health', label: 'Health' },
        { value: 'education', label: 'Education' },
        { value: 'entertainment', label: 'Entertainment' }
    ];

    constructor(private fb: FormBuilder) {
        this.postForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            banner: [''],
            category: ['', Validators.required],
            content: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        // Load Quill.js if not already loaded
        if (typeof Quill === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
            script.onload = () => {
                this.initQuill();
            };
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
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'script': 'sub'}, { 'script': 'super' }],
                            [{ 'indent': '-1'}, { 'indent': '+1' }],
                            [{ 'direction': 'rtl' }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'font': [] }],
                            [{ 'align': [] }],
                            ['clean'],
                            ['link', 'image']
                        ]
                    }
                });

                // Update form control when editor content changes
                this.quillEditor.on('text-change', () => {
                    const content = this.quillEditor.root.innerHTML;
                    this.postForm.get('content')?.setValue(content);
                });
            }
        }, 100);
    }

    onFileSelected(event: Event, fileInput: HTMLInputElement): void {
        if (fileInput.files && fileInput.files.length > 0) {
            this.selectedFile = fileInput.files[0];
            
            // Create image preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
            };
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

    onSaveDraft(): void {
        if (this.postForm.valid) {
            const formData = {
                ...this.postForm.value,
                content: this.quillEditor?.root.innerHTML || '',
                status: 'draft'
            };
            
            console.log('Saving draft:', formData);
            // Implement your draft saving logic here
        }
    }

    onPublish(): void {
        if (this.postForm.valid) {
            const formData = {
                ...this.postForm.value,
                content: this.quillEditor?.root.innerHTML || '',
                status: 'published'
            };
            
            console.log('Publishing post:', formData);
            // Implement your publish logic here
        } else {
            this.markFormGroupTouched();
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.postForm.controls).forEach(key => {
            this.postForm.get(key)?.markAsTouched();
        });
    }

    getErrorMessage(fieldName: string): string {
        const control = this.postForm.get(fieldName);
        if (control?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (control?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 3 characters long`;
        }
        return '';
    }
}