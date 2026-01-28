import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { HotelsComponent } from './pages/hotels/hotels.component';
import { HotelDetailComponent } from './pages/hotel-detail/hotel-detail.component';
import { HotelEditComponent } from './pages/hotel-edit/hotel-edit.component';
import { HotelCreateComponent } from './pages/hotel-create/hotel-create.component';
import { DestinationsComponent } from './pages/destinations/destinations.component';
import { DestinationDetailComponent } from './pages/destination-detail/destination-detail.component';
import { DestinationCreateComponent } from './pages/destination-create/destination-create.component';
import { DestinationEditComponent } from './pages/destination-edit/destination-edit.component';
import { PacksComponent } from './pages/packs/packs.component';
import { PackCreateComponent } from './pages/pack-create/pack-create.component';
import { PackDetailComponent } from './pages/pack-detail/pack-detail.component';
import { PackEditComponent } from './pages/pack-edit/pack-edit.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { ReservationDetailComponent } from './pages/reservation-detail/reservation-detail.component';
import { DestinationReservationDetailComponent } from './pages/destination-reservation-detail/destination-reservation-detail.component';
import { PackReservationDetailComponent } from './pages/pack-reservation-detail/pack-reservation-detail.component';

export const routes: Routes = [
  {
    path:'',
    component:AppLayoutComponent,
    children:[
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title:
          'Angular Ecommerce Dashboard | TailAdmin - Angular Admin Dashboard Template',
      },
      {
        path:'calendar',
        component:CalenderComponent,
        title:'Angular Calender | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'hotels',
        component: HotelsComponent,
        title: 'Hotels | TailAdmin',
      },
      {
        path: 'hotels/create',
        component: HotelCreateComponent,
        title: 'Create Hotel',
      },
      {
        path: 'hotels/:id',
        component: HotelDetailComponent,
        title: 'Hotel Details | TailAdmin',
      },
      {
        path: 'hotels/:id/edit',
        component: HotelEditComponent,
        title: 'Edit Hotel | TailAdmin',
      },
      {
        path: 'destinations',
        component: DestinationsComponent,
        title: 'Destinations | TailAdmin',
      },
      {
        path: 'destinations/create',
        component: DestinationCreateComponent,
        title: 'Create Destination',
      },
      {
        path: 'destinations/:id',
        component: DestinationDetailComponent,
        title: 'Destination Details | TailAdmin',
      },
      {
        path: 'destinations/:id/edit',
        component: DestinationEditComponent,
        title: 'Edit Destination | TailAdmin',
      },
      {
        path: 'packs',
        component: PacksComponent,
        title: 'Packs | TailAdmin',
      },
      {
        path: 'packs/create',
        component: PackCreateComponent,
        title: 'Create Pack',
      },
      {
        path: 'packs/:id',
        component: PackDetailComponent,
        title: 'Pack Details',
      },
      {
        path: 'packs/:id/edit',
        component: PackEditComponent,
        title: 'Edit Pack',
      },
      {
        path: 'reservations',
        component: ReservationsComponent,
        title: 'Reservations | TailAdmin',
      },
      {
        path: 'reservations/:id',
        component: ReservationDetailComponent,
        title: 'Reservation Details | TailAdmin',
      },
      {
        path: 'destination-reservations/:id',
        component: DestinationReservationDetailComponent,
        title: 'Destination Reservation Details | TailAdmin',
      },
      {
        path: 'pack-reservations/:id',
        component: PackReservationDetailComponent,
        title: 'Pack Reservation Details | TailAdmin',
      },
      {
        path:'profile',
        component:ProfileComponent,
        title:'Angular Profile Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'form-elements',
        component:FormElementsComponent,
        title:'Angular Form Elements Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'basic-tables',
        component:BasicTablesComponent,
        title:'Angular Basic Tables Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'blank',
        component:BlankComponent,
        title:'Angular Blank Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      // support tickets
      {
        path:'invoice',
        component:InvoicesComponent,
        title:'Angular Invoice Details Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'line-chart',
        component:LineChartComponent,
        title:'Angular Line Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'bar-chart',
        component:BarChartComponent,
        title:'Angular Bar Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'alerts',
        component:AlertsComponent,
        title:'Angular Alerts Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'avatars',
        component:AvatarElementComponent,
        title:'Angular Avatars Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'badge',
        component:BadgesComponent,
        title:'Angular Badges Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'buttons',
        component:ButtonsComponent,
        title:'Angular Buttons Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'images',
        component:ImagesComponent,
        title:'Angular Images Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'videos',
        component:VideosComponent,
        title:'Angular Videos Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
    ]
  },
  // auth pages
  {
    path:'signin',
    component:SignInComponent,
    title:'Angular Sign In Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'signup',
    component:SignUpComponent,
    title:'Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  // error pages
  {
    path:'**',
    component:NotFoundComponent,
    title:'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
];
