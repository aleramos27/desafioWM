# Desafío Técnico QA - Playwright + JavaScript (Lider.cl)
 Escenarios que automatice:
 1. Agregar productos al carrito
 2. Editar carrito
 3. eliminar carrito

 NOTA: no tome flujos de compra, de crear cuenta o ingresar con cuenta por motivos de privacidad de datos, ya que debo ingresar datos reales como 
 RUT, correo electronico, tdd o tdc.
 

# Requisitos previos
- Node.js 18+
- Chrome instalado (se usa `channel: 'chrome'` para reducir detección).

# Instalación
npm install
npm run prepare


# Mitigaciones WAF (importante)
- **Navegador real**: `channel: 'chrome'` en `playwright.config.js`.
- **Headers realistas**: `Accept-Language` y `userAgent` de Chrome estable.
- **Locale/TZ de Chile**: `es-CL` y `America/Santiago`.
- **Eliminar `navigator.webdriver`** y ajustar `languages/platform` desde `wafBypass.js`.
- **Contexto persistente (opcional)**: `npm run storage` abre Chrome no headless una sola vez, para guardar consentimiento/cookies en `storageStates/lider.json`.
- **Bloqueo de recursos pesados** para reducir ruido (imágenes/fuentes).


Ejecución
bash
# Todos los tests
npm test

# Modo headed UTILIZAR EN PAGINA PRODUCTIVA
npm run test:headed

# Reporte HTML
npm run test:report
```

Variables y datos
- `data/testProducts.json` define los términos de búsqueda.

- Page Object Model (POM).
- Separación de helpers para mitigación WAF.


