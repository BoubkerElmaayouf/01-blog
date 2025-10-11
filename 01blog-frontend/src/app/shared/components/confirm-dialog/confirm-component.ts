import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Confirm Action</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">Confirm</button>
    </mat-dialog-actions>
  `,
  styles: [`
    ::ng-deep .mat-mdc-dialog-container {
      --mdc-dialog-container-shape: 0px;
      border-radius: 4px !important;
    }

    ::ng-deep .mat-mdc-dialog-surface {
      border-radius: 0 !important;
    }

    h2[mat-dialog-title] {
      color: #000000;
      font-size: 20px;
      font-weight: 500;
      margin: 0;
      padding: 24px 24px 20px 24px;
    }

    mat-dialog-content {
      font-size: 16px;
      color: rgba(0, 0, 0, 0.87);
      line-height: 20px;
      padding: 0 24px 24px 24px !important;
      min-width: 300px;
    }

    mat-dialog-content p {
      margin: 0;
    }

    mat-dialog-actions {
      padding: 16px 24px !important;
      min-height: 52px;
      margin: 0 !important;
    }

    button[mat-button],
    button[mat-raised-button] {
      border-radius: 0 !important;
      font-weight: 500;
      text-transform: uppercase;
      margin-left: 8px;
      padding: 8px 16px;
    }

    button[mat-button] {
      color: #000000;
    }

    button[mat-raised-button] {
      background-color: #000000;
      color: #ffffff;
    }

    button[mat-raised-button]:hover {
      background-color: #212121;
    }

    ::ng-deep .mat-mdc-button,
    ::ng-deep .mat-mdc-raised-button {
      border-radius: 4px !important;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}