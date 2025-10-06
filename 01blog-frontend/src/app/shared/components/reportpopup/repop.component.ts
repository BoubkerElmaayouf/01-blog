import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";

export interface ReportData {
  postId: string;
  title: string
  reason: string;
  description: string;
  type: 'POST' | 'GENERAL' | 'PROFILE';
}

@Component({
    selector: 'app-reportpopup',
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      MatIconModule,
      MatFormFieldModule,
      MatSelectModule,
      MatInputModule,
      MatButtonModule
    ],
    templateUrl: './repop.component.html',
    styleUrls: ['./repop.component.css']
})
export class repopopComponent implements OnInit {
  @Input() postId: string = '';
  @Input() title: string= ''
  @Input() reportType: 'POST' | 'GENERAL' | 'PROFILE' = 'POST';
  @Input() isVisible: boolean = false;
  
  @Output() onSubmit = new EventEmitter<ReportData>();
  @Output() onCancel = new EventEmitter<void>();
  
  reason: string = '';
  description: string = '';
  
  reasonOptions: string[] = [
    'Spam or misleading content',
    'Harassment or bullying',
    'Hate speech',
    'Violence or dangerous content',
    'Copyright infringement',
    'Privacy violation',
    'Other'
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Initialize component
  }

  handleSubmit() {
    if (this.reason.trim() && this.description.trim()) {
      const reportData: ReportData = {
        postId: this.postId,
        title: '',
        reason: this.reason,
        description: this.description,
        type: this.reportType
      };
      this.onSubmit.emit(reportData);
      this.resetForm();
    }
  }

  handleCancel() {
    this.resetForm();
    this.onCancel.emit();
  }

  private resetForm() {
    this.reason = '';
    this.description = '';
  }

  get isFormValid(): boolean {
    return this.reason.trim().length > 0 && this.description.trim().length > 0;
  }


}