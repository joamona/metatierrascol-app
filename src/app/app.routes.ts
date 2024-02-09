import { Routes } from '@angular/router';

import { InitialScreenComponent } from './components/initial-screen/initial-screen.component';
import { MainScreenComponent } from './components/main-screen/main-screen.component';
import { AdvancedComponent } from './components/advanced/advanced.component';
import { SetConexionComponent } from './components/advanced/set-conexion/set-conexion.component';
import { BaunitComponent } from './components/baunit/baunit.component';
export const routes: Routes = [
  { path: '', component: InitialScreenComponent },
  { path: 'main-screen', component: MainScreenComponent },
  { path: 'main-screen/advanced', component: AdvancedComponent },
  { path: 'main-screen/advanced/set-conexion', component: SetConexionComponent },
  { path: 'main-screen/baunit', component: BaunitComponent },
];
