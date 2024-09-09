import { Routes } from '@angular/router';

import { InitialScreenComponent } from './components/initial-screen/initial-screen.component';
import { MainScreenComponent } from './components/main-screen/main-screen.component';
import { AdvancedComponent } from './components/advanced/advanced.component';
import { SetConexionComponent } from './components/advanced/set-conexion/set-conexion.component';
import { BaunitComponent } from './components/baunit/baunit.component';
import {MenuPredioComponent} from "./components/menu-predio/menu-predio.component";
import {InteresadoComponent} from "./components/interesado/interesado.component";
import {ListInteresadosComponent} from "./components/list-interesados/list-interesados.component";
import {MedirGpsListComponent} from "./components/medir-gps-list/medir-gps-list.component";
import {MedirGpsComponent} from "./components/medir-gps/medir-gps.component";
import {PuntosListComponent} from "./components/puntos-list/puntos-list.component";
import {PuntoComponent} from "./components/punto/punto.component";
import { AboutComponent } from './components/about/about.component';
import { AyudaComponent } from './components/ayuda/ayuda.component';
import { RemoveTokenComponent } from './components/advanced/remove-token/remove-token.component';
import { RemoveSessionsComponent } from './components/advanced/remove-sessions/remove-sessions.component';
import { FieldImageComponent } from './components/images/field-image/field-image.component';

export const routes: Routes = [
  { path: '', component: InitialScreenComponent },
  { path: 'main-screen', component: MainScreenComponent }, 
  { path: 'about', component: AboutComponent },
  { path: 'ayuda', component: AyudaComponent },  
  { path: 'main-screen/advanced', component: AdvancedComponent },
  { path: 'main-screen/advanced/set-conexion', component: SetConexionComponent },
  { path: 'main-screen/advanced/remove-token', component: RemoveTokenComponent },
  { path: 'main-screen/advanced/remove-sessions', component: RemoveSessionsComponent },
  //{ path: 'main-screen/baunit', component: BaunitComponent },

  { path: 'main-screen/menu-predio/field-image', component: FieldImageComponent },

  { path: 'main-screen/menu-predio', component: MenuPredioComponent },
  { path: 'main-screen/menu-predio/baunit', component: BaunitComponent },
  { path: 'main-screen/menu-predio/list-interesados', component: ListInteresadosComponent },
  { path: 'main-screen/menu-predio/list-interesados/interesado', component: InteresadoComponent },
  { path: 'main-screen/menu-predio/medir-gps-list', component: MedirGpsListComponent },
  { path: 'main-screen/menu-predio/medir-gps-list/medir-gps', component: MedirGpsComponent },
  { path: 'main-screen/menu-predio/puntos-list', component: PuntosListComponent },
  { path: 'main-screen/menu-predio/puntos-list/punto', component: PuntoComponent },
];
