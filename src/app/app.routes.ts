import { Routes } from '@angular/router';
import { InitalScreenComponent } from './components/initial-screen/initial-screen.component';
import { MainScreenComponent } from './components/main-screen/main-screen.component';
import { AdvancedComponent } from './components/advanced/advanced.component';
import { SetConexionComponent
 } from './components/advanced/set-conexion/set-conexion.component';
export const routes: Routes = [
  { path: '', component: InitalScreenComponent },
  { path: 'main-screen', component: MainScreenComponent },
  { path: 'advanced', component: AdvancedComponent },
  { path: 'advanced/set-conexion', component: SetConexionComponent },
];
