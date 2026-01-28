import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReservationService } from '../../shared/services/reservation.service';
import { ReservationDTO } from '../../shared/models/reservation-dto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-destination-reservation-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './destination-reservation-detail.component.html',
  styleUrl: './destination-reservation-detail.component.css',
})
export class DestinationReservationDetailComponent implements OnInit {
  loading = false;
  error: string | null = null;
  item: ReservationDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.error = null;

    this.reservationService.getByIdAdminDestination(id).subscribe({
      next: (r) => {
        this.item = r;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load destination reservation';
      },
    });
  }

  // -------- formatting --------
  fmtDate(v?: string) {
    if (!v) return '—';
    return new Date(v).toLocaleDateString();
  }

  fmtDateTime(v?: string) {
    if (!v) return '—';
    return new Date(v).toLocaleString();
  }

  money(v?: number) {
    if (v == null || Number.isNaN(v)) return '—';
    return `${v.toFixed(2)} TND`;
  }

  nights(): number {
    const r = this.item;
    if (!r?.checkIn || !r?.checkOut) return 0;
    const a = new Date(r.checkIn);
    const b = new Date(r.checkOut);
    const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  }

  payingPeople(): number {
    const r = this.item;
    if (!r) return 0;
    return (r.adults ?? 0) + (r.children ?? 0);
  }

  // -------- PDF (client-side) --------
  downloadPdf() {
    if (!this.item) return;

    const r = this.item;
    const doc = new jsPDF();
    const now = new Date();

    const nights = this.nights();
    const adults = r.adults ?? 0;
    const children = r.children ?? 0;
    const people = adults + children;

    // price per person per night if you want to show formula:
    // total = price * people * nights => price = total/(people*nights)
    const total = Number(r.totalAmount ?? 0);
    const pricePerPersonPerNight =
      people > 0 && nights > 0 ? total / (people * nights) : 0;

    doc.setFontSize(16);
    doc.text('FACTURE - Réservation Destination (ADMIN)', 14, 18);

    doc.setFontSize(10);
    doc.text(`N° Facture: DEST-${r.id}`, 14, 26);
    doc.text(`Date: ${now.toLocaleDateString()}`, 14, 32);

    doc.setFontSize(12);
    doc.text(`Destination: ${r.destinationName || '-'}`, 14, 44);

    doc.setFontSize(10);
    doc.text(
      `Lieu: ${(r.destinationCountry || '-')}${r.destinationLocation ? ' • ' + r.destinationLocation : ''}`,
      14,
      52
    );

    doc.text(`Client: ${r.userName || '-'} (${r.userEmail || '-'})`, 14, 60);

    doc.text(`Arrivée: ${r.checkIn || '-'}`, 14, 70);
    doc.text(`Départ: ${r.checkOut || '-'}`, 14, 76);
    doc.text(`Nuits: ${nights}`, 14, 82);

    doc.text(`Voyageurs: ${adults} adulte(s), ${children} enfant(s)`, 14, 92);
    doc.text(`Prix estimé: ${pricePerPersonPerNight.toFixed(2)} TND / pers / nuit`, 14, 98);

    autoTable(doc, {
      startY: 108,
      head: [['Type', 'Nombre', 'Nuits', 'Total (TND)']],
      body: [
        ['Adultes', `${adults}`, `${nights}`, `${(total * (adults / Math.max(people, 1))).toFixed(2)}`],
        ['Enfants', `${children}`, `${nights}`, `${(total * (children / Math.max(people, 1))).toFixed(2)}`],
      ],
      styles: { fontSize: 9 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 108;
    doc.setFontSize(12);
    doc.text(`TOTAL: ${total.toFixed(2)} TND`, 14, finalY + 14);

    doc.save(`DEST-${r.id}.pdf`);
  }
}
