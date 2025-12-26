import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';

@Component({
    selector: 'app-request-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './request-modal.component.html',
    styleUrl: './request-modal.component.css'
})
export class RequestModalComponent implements OnInit {
    @Input() request: any;
    @Input() userRole: string = '';
    @Input() userId: number = 0;
    @Output() close = new EventEmitter<void>();
    @Output() updated = new EventEmitter<void>();

    // Feedback fields
    stars = [1, 2, 3, 4, 5];
    rating: number = 0;
    comments: string = '';

    // Resolution fields
    selectedFile: File | null = null;
    resolutionNotes: string = '';
    isSubmitting = false;

    constructor(private requestService: RequestService) { }

    ngOnInit(): void {
        if (this.request.feedback_rating) {
            this.rating = this.request.feedback_rating;
            this.comments = this.request.feedback_comments;
        }
    }

    getMediaUrl(path: string | null): string {
        if (!path) return '';
        // If it starts with /uploads, it's a legacy disk path
        if (path.startsWith('/uploads/')) {
            return `http://localhost:3000${path}`;
        }
        // Otherwise assume it's a MongoDB ID
        return `http://localhost:3000/api/media/${path}`;
    }

    handleImageError(event: any, type: 'avatar' | 'image'): void {
        const placeholder = type === 'avatar' ? 'assets/placeholder-avatar.png' : 'assets/placeholder-image.png';
        event.target.src = placeholder;
    }

    onFileSelected(event: any): void {
        this.selectedFile = event.target.files[0];
    }

    setRating(val: number): void {
        if (this.request.status === 'Resolved' && !this.request.feedback_rating) {
            this.rating = val;
        }
    }

    submitResolution(): void {
        if (!this.selectedFile) {
            alert('Please upload a completion photo.');
            return;
        }

        this.isSubmitting = true;
        const formData = new FormData();
        formData.append('completion_media', this.selectedFile);
        formData.append('notes', this.resolutionNotes);

        this.requestService.resolveRequest(this.request.id, formData).subscribe({
            next: () => {
                this.isSubmitting = false;
                alert('Task marked as resolved!');
                this.updated.emit();
                this.close.emit();
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error('Resolution error:', err);
                alert('Failed to resolve task.');
            }
        });
    }

    submitFeedback(): void {
        if (this.rating === 0) {
            alert('Please provide a star rating.');
            return;
        }

        this.isSubmitting = true;
        this.requestService.submitFeedback(this.request.id, {
            feedback_rating: this.rating,
            feedback_comments: this.comments
        }).subscribe({
            next: () => {
                this.isSubmitting = false;
                alert('Thank you for your feedback!');
                this.updated.emit();
                this.close.emit();
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error('Feedback error:', err);
                alert('Failed to submit feedback.');
            }
        });
    }
}
