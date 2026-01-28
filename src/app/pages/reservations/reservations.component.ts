import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReservationService } from '../../shared/services/reservation.service';
import { ReservationDTO } from '../../shared/models/reservation-dto';
import { forkJoin } from 'rxjs';

type Tab = 'HOTELS' | 'DESTINATIONS' | 'PACKS';

@Component({
  selector: 'app-reservations',
  imports: [CommonModule, RouterModule],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.css',
})
export class ReservationsComponent implements OnInit {
  loading = false;
  error: string | null = null;

  tab: Tab = 'HOTELS';

  hotelItems: ReservationDTO[] = [];
  destinationItems: ReservationDTO[] = [];
  packItems: ReservationDTO[] = [];

  get items(): ReservationDTO[] {
    if (this.tab === 'HOTELS') return this.hotelItems;
    if (this.tab === 'DESTINATIONS') return this.destinationItems;
    return this.packItems;
  }

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;

    forkJoin({
      hotels: this.reservationService.getAllAdmin(),
      dests: this.reservationService.getAllAdminDestinations(),
      packs: this.reservationService.getAllAdminPacks(), // ✅ NEW
    }).subscribe({
      next: ({ hotels, dests, packs }) => {
        this.hotelItems = hotels ?? [];
        this.destinationItems = dests ?? [];
        this.packItems = packs ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load reservations';
      },
    });
  }

  setTab(t: Tab) {
    this.tab = t;
  }

  fmtDate(v?: string) {
    if (!v) return '—';
    return new Date(v).toLocaleDateString();
  }

  money(v?: number) {
    if (v == null) return '—';
    return `${v.toFixed(2)} TND`;
  }

  detailsLink(r: ReservationDTO) {
    if (this.tab === 'HOTELS') return ['/reservations', r.id];
    if (this.tab === 'DESTINATIONS') return ['/destination-reservations', r.id];
    return ['/pack-reservations', r.id];
  }
}
