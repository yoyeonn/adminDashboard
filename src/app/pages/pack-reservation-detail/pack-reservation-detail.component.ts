import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReservationService } from '../../shared/services/reservation.service';
import { ReservationDTO } from '../../shared/models/reservation-dto';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type RoomRow = {
  name: string;
  price: number;
  adults: number;
  children: number;
  babies: number;
  paying: number;
};

@Component({
  selector: 'app-pack-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pack-reservation-detail.component.html',
  styleUrl: './pack-reservation-detail.component.css',
})
export class PackReservationDetailComponent implements OnInit {
  loading = false;
  error: string | null = null;
  item: ReservationDTO | any | null = null;

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

    this.reservationService.getByIdAdminPack(id).subscribe({
      next: (r) => {
        // ensure type exists
        this.item = { ...(r as any), type: 'PACK' };
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message || err?.message || 'Failed to load pack reservation';
      },
    });
  }

  // ---------- formatting ----------
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
    return `${Number(v).toFixed(2)} TND`;
  }

  // ---------- helpers ----------
  private splitCsv(s?: string): string[] {
    if (!s) return [];
    return String(s)
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
  }

  private numCsv(s?: string): number[] {
    return this.splitCsv(s).map((x) => Number(x) || 0);
  }

  // ---------- derived ----------
  nights(): number {
    const r = this.item;
    if (!r?.checkIn || !r?.checkOut) return 0;
    const a = new Date(r.checkIn);
    const b = new Date(r.checkOut);
    const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  }

  /** Parse rooms from CSV columns returned by backend */
  roomRows(): RoomRow[] {
    const r = this.item;
    if (!r) return [];

    const names = this.splitCsv(r.roomNames);
    const prices = this.numCsv(r.roomPrices);
    const adults = this.numCsv(r.roomAdults);
    const children = this.numCsv(r.roomChildren);
    const babies = this.numCsv(r.roomBabies);

    const n = Math.max(names.length, prices.length, adults.length, children.length, babies.length);

    const rows: RoomRow[] = [];
    for (let i = 0; i < n; i++) {
      const name = names[i] ?? `Chambre ${i + 1}`;
      const price = prices[i] ?? 0;
      const a = adults[i] ?? 0;
      const c = children[i] ?? 0;
      const b = babies[i] ?? 0;
      rows.push({
        name,
        price,
        adults: a,
        children: c,
        babies: b,
        paying: a + c,
      });
    }
    return rows;
  }

  totalAdultsFromRooms(): number {
    return this.roomRows().reduce((sum, x) => sum + (x.adults || 0), 0);
  }

  totalChildrenFromRooms(): number {
    return this.roomRows().reduce((sum, x) => sum + (x.children || 0), 0);
  }

  totalBabiesFromRooms(): number {
    return this.roomRows().reduce((sum, x) => sum + (x.babies || 0), 0);
  }

  payingPeopleFromRooms(): number {
    return this.roomRows().reduce((sum, x) => sum + (x.paying || 0), 0);
  }

  /**
   * If you still store adults/children in DB, we prefer rooms if present.
   */
  payingPeople(): number {
    const roomsPaying = this.payingPeopleFromRooms();
    if (roomsPaying > 0) return roomsPaying;

    const r = this.item;
    if (!r) return 0;
    return (r.adults ?? 0) + (r.children ?? 0);
  }

  /** Best location key: backend uses packLocation in detail, location in invoice */
  bestLocation(r: any): string {
    return r?.packLocation ?? r?.location ?? '—';
  }

  // ---------- PDF ----------
  downloadPdf() {
    const id = this.item?.id;
    if (!id) return;

    this.reservationService.getInvoiceJsonAdminPack(id).subscribe({
      next: (inv) => {
        const doc = new jsPDF();
        const now = new Date();

        // invoice data
        const packName = inv.packName ?? this.item?.packName ?? '-';
        const location = inv.location ?? this.item?.packLocation ?? this.item?.location ?? '-';

        const hotelName = inv.hotelName ?? this.item?.hotelName ?? '-';
        const destinationName = inv.destinationName ?? this.item?.destinationName ?? '-';

        const checkIn = inv.checkIn ?? this.item?.checkIn ?? '-';
        const checkOut = inv.checkOut ?? this.item?.checkOut ?? '-';

        const mealPlan = inv.mealPlan ?? this.item?.mealPlan ?? '-';
        const mealPlanExtra = Number(inv.mealPlanExtra ?? this.item?.mealPlanExtra ?? 0);

        const nights = Number(inv.nights ?? this.nights() ?? 0);

        // Prefer computed from invoice, else compute from rooms, else adults/children
        const payingPeople =
          Number(inv.payingPeople ?? 0) ||
          this.payingPeopleFromRooms() ||
          Number((inv.adults ?? this.item?.adults ?? 0) + (inv.children ?? this.item?.children ?? 0));

        const pricePerPerson = Number(inv.pricePerPerson ?? this.item?.pricePerPerson ?? 0);

        const basePackTotal =
          Number(inv.basePackTotal ?? 0) ||
          pricePerPerson * payingPeople * nights;

        const mealPlanTotal =
          Number(inv.mealPlanTotal ?? 0) ||
          mealPlanExtra * payingPeople * nights;

        const totalAmount = Number(inv.totalAmount ?? this.item?.totalAmount ?? (basePackTotal + mealPlanTotal));

        // Rooms from CSV (invoice)
        const names = this.splitCsv(inv.roomNames ?? this.item?.roomNames);
        const prices = this.numCsv(inv.roomPrices ?? this.item?.roomPrices);
        const adults = this.numCsv(inv.roomAdults ?? this.item?.roomAdults);
        const children = this.numCsv(inv.roomChildren ?? this.item?.roomChildren);
        const babies = this.numCsv(inv.roomBabies ?? this.item?.roomBabies);

        // Header
        doc.setFontSize(16);
        doc.text('FACTURE - Réservation Pack', 14, 18);

        doc.setFontSize(10);
        doc.text(`N° Facture: PACK-${id}`, 14, 26);
        doc.text(`Date: ${now.toLocaleDateString()}`, 14, 32);

        doc.setFontSize(12);
        doc.text(`Pack: ${packName}`, 14, 44);

        doc.setFontSize(10);
        if (location && location !== '-') doc.text(`Lieu: ${location}`, 14, 52);
        if (destinationName && destinationName !== '-') doc.text(`Destination: ${destinationName}`, 14, 58);
        if (hotelName && hotelName !== '-') doc.text(`Hôtel: ${hotelName}`, 14, 64);

        if (inv.userName || inv.userEmail) {
          doc.text(`Client: ${inv.userName || '-'} (${inv.userEmail || '-'})`, 14, 72);
        }

        doc.text(`Arrivée: ${checkIn}`, 14, 80);
        doc.text(`Départ: ${checkOut}`, 14, 86);
        doc.text(`Nuits: ${nights}`, 14, 92);

        doc.text(`Formule: ${this.mealPlanLabel(mealPlan as any)}`, 14, 98);
        doc.text(`Supplément formule: ${mealPlanExtra.toFixed(2)} TND / personne / nuit`, 14, 104);

        doc.text(`Voyageurs payants: ${payingPeople}`, 14, 110);

        // Rooms table (if any)
        const roomCount = Math.max(names.length, prices.length, adults.length, children.length, babies.length);
        if (roomCount > 0) {
          const rows = [];
          for (let i = 0; i < roomCount; i++) {
            const rn = names[i] ?? `Chambre ${i + 1}`;
            const rp = prices[i] ?? 0;
            const ra = adults[i] ?? 0;
            const rc = children[i] ?? 0;
            const rb = babies[i] ?? 0;
            rows.push([
              `${i + 1}`,
              rn,
              `${ra}`,
              `${rc}`,
              `${rb}`,
              `${ra + rc}`,
              `${rp.toFixed(2)} TND`,
            ]);
          }

          autoTable(doc, {
            startY: 118,
            head: [['#', 'Chambre', 'Adultes', 'Enfants', 'Bébés', 'Payants', 'Prix/pers']],
            body: rows,
            styles: { fontSize: 8 },
          });
        }

        const finalY = (doc as any).lastAutoTable?.finalY || 118;

        // Formula breakdown (THIS IS WHAT YOU WANTED ✅)
        autoTable(doc, {
          startY: finalY + 8,
          head: [['Formule', 'Calcul', 'Montant']],
          body: [
            [
              'Base Pack',
              `${pricePerPerson.toFixed(2)} × ${payingPeople} × ${nights}`,
              `${basePackTotal.toFixed(2)} TND`,
            ],
            [
              'Supplément formule',
              `${mealPlanExtra.toFixed(2)} × ${payingPeople} × ${nights}`,
              `${mealPlanTotal.toFixed(2)} TND`,
            ],
            ['TOTAL', '', `${totalAmount.toFixed(2)} TND`],
          ],
          styles: { fontSize: 9 },
        });

        const finalY2 = (doc as any).lastAutoTable?.finalY || finalY + 8;

        doc.setFontSize(12);
        doc.text(`Total à payer: ${totalAmount.toFixed(2)} TND`, 14, finalY2 + 14);

        doc.save(`PACK-${id}.pdf`);
      },
      error: (e) => {
        this.error = e?.error?.message || e?.message || 'Failed to download PDF';
      },
    });
  }

  mealPlanLabel(plan?: string): string {
  switch (plan) {
    case 'ROOM_ONLY':
      return 'Hébergement seul (chambre)';
    case 'BB':
      return 'Petit-déjeuner inclus';
    case 'HB':
      return 'Demi-pension (petit-déjeuner + 1 repas)';
    case 'FB':
      return 'Pension complète (petit-déjeuner + déjeuner + dîner)';
    case 'AI':
      return 'Tout compris';
    case 'UAI':
      return 'Ultra tout compris (extras inclus)';
    default:
      return '—';
    }
  }

}
