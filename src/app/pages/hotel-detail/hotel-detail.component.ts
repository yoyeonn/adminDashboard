import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HotelService } from '../../shared/services/hotel.service';
import { HotelDTO } from '../../shared/models/hotel-dto';


@Component({
  selector: 'app-hotel-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './hotel-detail.component.html',
  styleUrl: './hotel-detail.component.css',
})
export class HotelDetailComponent implements OnInit {
loading = false;
  error: string | null = null;

  hotel: HotelDTO | null = null;
  id!: number;
  deleting = false;

  constructor(private route: ActivatedRoute, private hotelService: HotelService, private router: Router,) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = Number(idParam);

    if (!this.id || Number.isNaN(this.id)) {
      this.error = 'Invalid hotel id';
      return;
    }

    this.fetchHotel();
  }

  fetchHotel(): void {
    this.loading = true;
    this.error = null;

    this.hotelService.getHotelById(this.id).subscribe({
      next: (hotel) => {
        this.hotel = hotel;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Failed to load hotel';
      },
    });
  }

  onDelete() {
    if (!this.id) return;

    const ok = confirm('Are you sure you want to delete this hotel? This action cannot be undone.');
    if (!ok) return;

    this.deleting = true;

    this.hotelService.deleteHotel(this.id).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/hotels']);
      },
      error: (err) => {
        this.deleting = false;
        alert(err?.error?.message || err?.message || 'Delete failed');
      },
    });
  }

  money(v?: number) {
  if (v == null || Number.isNaN(v)) return '—';
  return `${Number(v).toFixed(2)} TND`;
}

firstRoomPrice(): number {
  const rooms = (this.hotel as any)?.rooms ?? [];
  if (!Array.isArray(rooms) || rooms.length === 0) return 0;
  return Number(rooms[0]?.price || 0);
}

}
