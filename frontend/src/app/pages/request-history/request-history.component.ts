import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-request-history',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatTableModule, MatCardModule],
  templateUrl: './request-history.component.html',
  styleUrls: ['./request-history.component.css'],
})
export class RequestHistoryComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'category',
    'description',
    'status',
    'created_at',
  ];

  requests: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // TEMP resident id = 1
    this.http
      .get<any>('http://localhost:3000/requests/resident/1', {
        headers: { 'x-user-role': 'Resident' },
      })
      .subscribe({
        next: (res) => {
          this.requests = res.data;
        },
        error: (err) => {
          console.error('Failed to load request history', err);
        },
      });
  }
}
