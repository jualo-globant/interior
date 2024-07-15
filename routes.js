import Inicio from './src/routes/Inicio.svelte';
import Precios from './src/routes/Precios.svelte';
import Servicios from './src/routes/Servicios.svelte';
import SobreNosotros from './src/routes/SobreNosotros.svelte';
import ProyectosRealizados from './src/routes/ProyectosRealizados.svelte';
import Contacto from './src/routes/Contacto.svelte';

export const routes = [
  { path: '/', component: Inicio },
  { path: '/precios', component: Precios },
  { path: '/servicios', component: Servicios },
  { path: '/sobre-nosotros', component: SobreNosotros },
  { path: '/proyectos-realizados', component: ProyectosRealizados },
  { path: '/contacto', component: Contacto },
];
