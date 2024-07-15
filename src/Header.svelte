

<script>
  import { Link } from 'svelte-routing';
</script>
<!-- Preloader -->
    <div id="preloader">
        <div class="preload-content">
            <div id="dream-load"></div>
        </div>
    </div>

    <!-- ##### Header Area Start ##### -->
    <nav class="navbar navbar-expand-lg navbar-white fixed-top" id="banner">
        <div class="container">
            <!-- Brand -->
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a class="navbar-brand" href="#"><span><img draggable="false" src="img/core-img/logo.png" alt="logo"></span> Interior Tech</a>

            <!-- Toggler/collapsibe Button -->
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">
                <span class="navbar-toggler-icon"></span>
            </button>

            <!-- Navbar links -->
            <div class="collapse navbar-collapse" id="collapsibleNavbar">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item dropdown">
                        <!-- svelte-ignore a11y-invalid-attribute -->
                        <a class="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">Home</a>
                        <div class="dropdown-menu">
                            <Link class="dropdown-item" to="/">Home</Link>
                        </div>
                    </li>
                    <li class="nav-item">
                        <Link class="nav-link" to="/sobre-nosotros">Sobre Nosotros</Link>
                    </li>
                    <li class="nav-item">
                        <Link class="nav-link" to="/servicios">Servicios</Link>
                    </li>
                    <li class="nav-item dropdown">
                        <!-- svelte-ignore a11y-invalid-attribute -->
                        <a class="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">Projects</a>
                        <div class="dropdown-menu">
                            <Link class="dropdown-item" to="/proyectos-realizados">Project Details</Link>
                            <Link class="dropdown-item" to="/proyectos-realizados">Project Details</Link>
                        </div>
                    </li>
                    <li class="nav-item">
                        <Link class="nav-link" to="/proyectos-realizados">Proyectos Realizados</Link>
                    </li>
                    <li class="nav-item">
                            <Link class="nav-link" to="/precios">Precios</Link>
                    </li>
                    <li class="lh-55px"><Link class="btn login-btn ml-50" to="/contacto">Contacto</Link></li>
                </ul>
            </div>
        </div>
    </nav>
    <!-- ##### Header Area End ##### -->
