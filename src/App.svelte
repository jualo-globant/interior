<script>
	import Header from './Header.svelte';
    import Footer from './Footer.svelte';
    import { Router, Route } from 'svelte-routing';
    import { routes } from '../routes.js';
</script>

<Router>
<Header />
 {#each routes as { path, component }}
     <Route path={path} component={component} />
 {/each}
</Router>
<Footer />


