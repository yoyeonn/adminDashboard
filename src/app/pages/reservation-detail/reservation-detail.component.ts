import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReservationService } from '../../shared/services/reservation.service';
import { HotelService } from '../../shared/services/hotel.service';
import { ReservationDTO } from '../../shared/models/reservation-dto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type MealPlan = 'ROOM_ONLY' | 'BB' | 'HB' | 'FB' | 'AI' | 'UAI';

@Component({
  selector: 'app-reservation-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.css',
})
export class ReservationDetailComponent implements OnInit {
loading = false;
  error: string | null = null;
  item: ReservationDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.error = null;

    this.reservationService.getByIdAdmin(id).subscribe({
      next: async (r) => {
        this.item = r;

        // ✅ fetch hotel for location
        if (this.item?.hotelId) {
          try {
            const hotel = await this.hotelService.getHotelById(this.item.hotelId);
            const city = (hotel as any)?.city || '';
            const country = (hotel as any)?.country || '';
            const loc = [city, country].filter(Boolean).join(', ');
            this.item = { ...this.item, hotelLocation: loc || '—' };
          } catch {
            this.item = { ...this.item, hotelLocation: '—' };
          }
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load reservation';
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
    return `${v.toFixed(2)} TND`;
  }

  // ---------- business rules ----------
  mealPlanLabel(plan?: MealPlan) {
    switch (plan) {
      case 'ROOM_ONLY': return 'Hébergement seul (chambre)';
      case 'BB': return 'Petit-déjeuner inclus';
      case 'HB': return 'Demi-pension (petit-déjeuner + 1 repas)';
      case 'FB': return 'Pension complète (petit-déjeuner + déjeuner + dîner)';
      case 'AI': return 'Tout compris (repas + boissons locales + snacks)';
      case 'UAI': return 'Ultra tout compris (extras inclus)';
      default: return '—';
    }
  }

  mealPlanExtra(plan?: MealPlan): number {
    switch (plan) {
      case 'ROOM_ONLY': return 0;
      case 'BB': return 25;
      case 'HB': return 60;
      case 'FB': return 90;
      case 'AI': return 130;
      case 'UAI': return 170;
      default: return 0;
    }
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
    const adults = r.adults ?? 0;
    const children = r.children ?? 0;
    // babies usually free
    return adults + children;
  }

  formulaPricePerPersonPerNight(): number {
    return this.mealPlanExtra(this.item?.mealPlan);
  }

  formulaTotal(): number {
    const n = this.nights();
    const ppl = this.payingPeople();
    const extra = this.formulaPricePerPersonPerNight();
    return extra * ppl * n;
  }

  totalAllNights(): number {
    return this.item?.totalAmount ?? 0;
  }

  totalPerNight(): number {
    const n = this.nights();
    const total = this.totalAllNights();
    if (!n) return 0;
    return total / n;
  }

  // Optional: if you want "beds total" (rooms only) separate:
  roomsOnlyTotalAllNights(): number {
    const total = this.totalAllNights();
    const formula = this.formulaTotal();
    return Math.max(total - formula, 0);
  }

  roomsOnlyPerNight(): number {
    const n = this.nights();
    if (!n) return 0;
    return this.roomsOnlyTotalAllNights() / n;
  }

  downloadPdf() {
  const id = this.item?.id;
  if (!id) return;

  this.reservationService.getInvoiceJsonAdmin(id).subscribe({
    next: (inv) => {
      const doc = new jsPDF();
      const now = new Date();

      const nights = this.nights();
      const planLabel = this.mealPlanLabel(inv.mealPlan);
      const planExtra = this.mealPlanExtra(inv.mealPlan);

      const split = (v: any) =>
        String(v ?? '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

      const roomNames   = split(inv.roomNames);
      const roomPrices  = split(inv.roomPrices).map(Number);
      const roomAdults  = split(inv.roomAdults).map(Number);
      const roomChildren= split(inv.roomChildren).map(Number);
      const roomBabies  = split(inv.roomBabies).map(Number);

      doc.setFontSize(16);
      doc.text('FACTURE - Réservation Hôtel', 14, 18);

      doc.setFontSize(10);
      doc.text(`N° Facture: FAC-${inv.id}`, 14, 26);
      doc.text(`Date: ${now.toLocaleDateString()}`, 14, 32);

      doc.setFontSize(12);
      doc.text(`Hôtel: ${inv.hotelName || '-'}`, 14, 44);

      doc.setFontSize(10);
      if (inv.userName || inv.userEmail) {
        doc.text(`Client: ${inv.userName || '-'} (${inv.userEmail || '-'})`, 14, 52);
      }

      doc.text(`Arrivée: ${inv.checkIn || '-'}`, 14, 60);
      doc.text(`Départ: ${inv.checkOut || '-'}`, 14, 66);
      doc.text(`Nuits: ${nights}`, 14, 72);

      doc.text(`Formule: ${planLabel}`, 14, 80);
      doc.text(`Supplément formule: ${planExtra} TND / personne / nuit`, 14, 86);

      let totalPerNightNum = 0;

      const body = roomNames.map((name: string, i: number) => {
        const a = roomAdults[i] ?? 0;
        const c = roomChildren[i] ?? 0;
        const b = roomBabies[i] ?? 0;
        const paying = a + c;
        const pricePerPerson = roomPrices[i] ?? 0;

        const roomPerNight = paying * pricePerPerson;
        const formulaPerNight = paying * planExtra;
        const totalPerNight = roomPerNight + formulaPerNight;

        totalPerNightNum += totalPerNight;

        return [
          `${i + 1}`,
          name,
          `${a}`,
          `${c}`,
          `${b}`,
          `${paying}`,
          `${pricePerPerson.toFixed(2)} TND`,
          `${roomPerNight.toFixed(2)} TND`,
          `${formulaPerNight.toFixed(2)} TND`,
          `${totalPerNight.toFixed(2)} TND`,
        ];
      });

      autoTable(doc, {
        startY: 96,
        head: [[
          '#', 'Chambre', 'Adultes', 'Enfants', 'Bébés', 'Payants',
          'Prix/pers', 'Chambre/nuit', 'Formule/nuit', 'Total/nuit'
        ]],
        body,
        styles: { fontSize: 8 },
      });

      const totalAllNum =
        inv.totalAmount != null ? Number(inv.totalAmount) : totalPerNightNum * nights;

      const finalY = (doc as any).lastAutoTable?.finalY || 96;

      doc.setFontSize(12);
      doc.text(`Total / nuit: ${totalPerNightNum.toFixed(2)} TND`, 14, finalY + 14);
      doc.text(`Total (${nights} nuits): ${totalAllNum.toFixed(2)} TND`, 14, finalY + 22);

      doc.setFontSize(9);
      doc.text(`Note: Les bébés (0-2 ans) ne sont pas inclus dans la capacité ni dans le prix.`, 14, finalY + 32);

      doc.save(`FAC-${inv.id}.pdf`);
    },
    error: (e) => {
      this.error = e?.error?.message || 'Failed to download PDF';
    },
  });
}


}
