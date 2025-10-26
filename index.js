document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btnStart');
    const btnExplain = document.getElementById('btnExplain');
    const output = document.getElementById('output');
    const geoBlock = document.getElementById('geoBlock');
    const infoBlock = document.getElementById('infoBlock');
    const intro = document.getElementById('intro');
    const ethic = document.getElementById('ethic');
    const btnCloseEthic = document.getElementById('btnCloseEthic');
    const btnReset = document.getElementById('btnReset');

    btnExplain.addEventListener('click', ()=> {
      ethic.style.display = 'block';
      intro.style.display = 'none';
    });
    btnCloseEthic.addEventListener('click', ()=> {
      ethic.style.display = 'none';
      intro.style.display = 'block';
    });

    btnStart.addEventListener('click', async () => {
      intro.style.display = 'none';
      output.style.display = 'block';
      geoBlock.innerHTML = '<p class="small">Solicitando permiso de ubicación...</p>';

      // Mostrar info de navegador inmediatamente (no sensible)
      const ua = navigator.userAgent || 'Desconocido';
      const platform = navigator.platform || 'Desconocido';
      const lang = navigator.language || 'Desconocido';
      const width = screen.width, height = screen.height;
      let connection = 'No disponible';
      try {
        if (navigator.connection && navigator.connection.effectiveType) {
          connection = navigator.connection.effectiveType + (navigator.connection.downlink ? ' · downlink:' + navigator.connection.downlink + 'Mbps' : '');
        }
      } catch (e) {}

      infoBlock.innerHTML = `
        <pre>
        User Agent: ${ua}
        Platform: ${platform}
        Idioma: ${lang}
        Pantalla: ${width} × ${height} px
        Conexión (si disponible): ${connection}
        </pre>
      `;

      // Solicitar geolocalización (solo si está disponible y la página se sirve en HTTPS)
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          const lat = pos.coords.latitude.toFixed(6);
          const lon = pos.coords.longitude.toFixed(6);
          const acc = pos.coords.accuracy ? pos.coords.accuracy + ' m' : 'Desconocida';
          geoBlock.innerHTML = `
            <h3>Coordenadas</h3>
            <pre>Latitud: ${lat}\nLongitud: ${lon}\nPrecisión: ${acc}</pre>
            <p class="small">Estas coordenadas se obtuvieron con tu permiso y <strong>no se envían a ningún servidor</strong>.</p>
          `;
        }, function(err) {
          geoBlock.innerHTML = '<p class="small">No se pudo obtener la ubicación o el permiso fue denegado.</p>';
        }, {
          enableHighAccuracy: false,
          maximumAge: 60_000,
          timeout: 10_000
        });
      } else {
        geoBlock.innerHTML = '<p class="small">API de geolocalización no disponible en este navegador.</p>';
      }
    });

    btnReset.addEventListener('click', ()=> {
      output.style.display = 'none';
      intro.style.display = 'block';
      geoBlock.innerHTML = '';
      infoBlock.innerHTML = '';
    });
})