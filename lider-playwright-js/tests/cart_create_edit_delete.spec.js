const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { hardenPage } = require('../src/helpers/wafBypass.js');
const { HomePage } = require('../src/pages/HomePage.js');
const { SearchResultsPage } = require('../src/pages/SearchResultsPage.js');
const { CartPage } = require('../src/pages/CartPage.js');
const data = require('../data/testProducts.json');

test.describe.configure({ mode: 'serial' }); // Misma sesión para todos los tests en este archivo

function pause(min = 200, max = 700) {
  const ms = Math.floor(Math.random() * (max - min)) + min;
  return new Promise(r => setTimeout(r, ms));
}

test.describe('Crear y Editar carrito', () => {
  let home, results, cart;
  let productoCama, productoTaladro, productoBateria;

  test.beforeAll(() => {
    if (!data.products || data.products.length < 3) {
      throw new Error('El archivo data/testProducts.json debe contener al menos 3 productos.');
    }
    const productos = data.products.map(p => p.term);
    [productoCama, productoTaladro, productoBateria] = productos;
  });

  test.beforeEach(async ({ page }) => {
    await hardenPage(page);
    home = new HomePage(page);
    results = new SearchResultsPage(page);
    cart = new CartPage(page);
  });


  test('Agregar 3 productos por búsqueda', async ({ page }) => {
    await home.goto();

    for (const { term } of data.products) {
      await home.search(term);
      await results.waitForResults();
      await results.addProductByTerm(term);
      await pause();
    }

    await cart.open();
    const count = await cart.getCartCount();
    await expect(count, 'Carro debe reflejar 3 productos').toBe(3);     //Crear y guardar storageState
    const dir = path.join(process.cwd(), 'storageStates');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const finalPath = path.join(dir, 'cart-temp.json');
     const tmpPath = path.join(dir, `cart-temp.${Date.now()}.tmp.json`);    //archivo temporal
    await page.context().storageState({ path: tmpPath });   //JSON se escribió
    JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));    //Renombrar
    fs.renameSync(tmpPath, finalPath);
  });

  test('Editar carrito: expandir, Eliminar Cama, +2 Taladro, validar cantidades', async ({ browser }) => {
    const storageFile = path.join(process.cwd(), 'storageStates', 'cart-temp.json');

    if (!fs.existsSync(storageFile)) {
      test.skip(true, 'No existe storageStates/cart-temp.json.');
    }
    const raw = fs.readFileSync(storageFile, 'utf-8');
    try {
      JSON.parse(raw);
    } catch (err) {
      throw new Error(`El archivo ${storageFile} está corrupto o vacío. Ejecútalo nuevamente.`);
    }

    const context = await browser.newContext({  // Crear contexto nuevo con la sesión guardada
      storageState: storageFile,
      locale: 'es-CL',
      timezoneId: 'America/Santiago',
    });
    const page = await context.newPage();
    await hardenPage(page);
    const home = new HomePage(page);
    const cart = new CartPage(page);
    await home.goto();
    await cart.open();
    await cart.expandSectionsIfAny();
    await cart.removeByName(productoCama);
    await pause();
    await cart.increaseQtyByName(productoTaladro, 1);
    await pause();

    await context.close();
  });


test('Vaciar Carrito de compra', async ({ browser }) => {
    const storageFile = path.join(process.cwd(), 'storageStates', 'cart-temp.json');

    if (!fs.existsSync(storageFile)) {
      test.skip(true, 'No existe storageStates/cart-temp.json.');
    }
    const raw = fs.readFileSync(storageFile, 'utf-8');
    try {
      JSON.parse(raw);
    } catch (err) {
      throw new Error(`El archivo ${storageFile} está corrupto o vacío. Ejecútalo nuevamente.`);
    }

    const context = await browser.newContext({  // Crear contexto nuevo con la sesión guardada
      storageState: storageFile,
      locale: 'es-CL',
      timezoneId: 'America/Santiago',
    });
     const page = await context.newPage();
  await hardenPage(page);

  const home = new HomePage(page);
  const cart = new CartPage(page);

  await home.goto();
   await home.goto();
   await cart.open();
   await cart.expandSectionsIfAny();
   await cart.removeByName(productoCama);
   await pause();

  await context.close();
  });

});
