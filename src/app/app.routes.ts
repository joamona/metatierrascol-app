import { Routes } from '@angular/router';

import { InitialScreenComponent } from './components/initial-screen/initial-screen.component';
import { MainScreenComponent } from './components/main-screen/main-screen.component';
import { AdvancedComponent } from './components/advanced/advanced.component';
import { SetConexionComponent } from './components/advanced/set-conexion/set-conexion.component';
import { BaunitComponent } from './components/baunit/baunit.component';
import {MenuPredioComponent} from "./components/menu-predio/menu-predio.component";
import {InteresadoComponent} from "./components/interesado/interesado.component";
import {ListInteresadosComponent} from "./components/list-interesados/list-interesados.component";
export const routes: Routes = [
  { path: '', component: InitialScreenComponent },
  { path: 'main-screen', component: MainScreenComponent },
  { path: 'main-screen/advanced', component: AdvancedComponent },
  { path: 'main-screen/advanced/set-conexion', component: SetConexionComponent },
  //{ path: 'main-screen/baunit', component: BaunitComponent },
  { path: 'main-screen/menu-predio', component: MenuPredioComponent },
  { path: 'main-screen/menu-predio/baunit', component: BaunitComponent },
  { path: 'main-screen/menu-predio/list-interesados', component: ListInteresadosComponent },
  { path: 'main-screen/menu-predio/list-interesados/interesado', component: InteresadoComponent },
];
