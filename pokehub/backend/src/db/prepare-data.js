/**
 * prepare-data.js
 *
 * Objetivo:
 * - coger los datos fuente de Pokemon Showdown
 * - copiarlos dentro de este proyecto
 * - guardarlos ya como archivos .js para que el backend trabaje con .js
 *
 * Uso:
 * node src/db/prepare-data.js <ruta-a-pokemon-showdown-master/data>
 */

// Módulo para trabajar con archivos.
const fs = require('fs');
// Módulo para construir rutas.
const path = require('path');

// Carpeta origen. Si no se pasa por consola, usamos la que suele estar al lado del proyecto.
const SOURCE = process.argv[2] || path.join(__dirname, '..', '..', '..', '..', 'pokemon-showdown-master', 'data');

// Carpeta destino dentro del proyecto.
const DEST = path.join(__dirname, '..', '..', '..', 'showdown-data');

// Lista de archivos que sí necesitamos para crear la BD.
const FILES_NEEDED = [
  'pokedex',
  'moves',
  'abilities',
  'items',
  'learnsets',
  'formats-data',
  'natures',
];

// Si la carpeta origen no existe, paramos y avisamos.
if (!fs.existsSync(SOURCE)) {
  console.error(`\n❌ No se encuentra la carpeta de Showdown en: ${SOURCE}`);
  console.error('   Uso: node src/db/prepare-data.js <ruta-a-pokemon-showdown-master/data>\n');
  process.exit(1);
}

// Creamos la carpeta destino si aún no existe.
fs.mkdirSync(DEST, { recursive: true });

// Contador de archivos bien preparados.
let ok = 0;

// Recorremos solo los archivos necesarios.
for (const baseName of FILES_NEEDED) {
  // Archivo original en TypeScript.
  const sourceFile = path.join(SOURCE, `${baseName}.ts`);

  // Archivo final renombrado a .js dentro de nuestro backend.
  const destFile = path.join(DEST, `${baseName}.js`);

  // Si el archivo fuente no existe, avisamos y seguimos.
  if (!fs.existsSync(sourceFile)) {
    console.warn(`⚠️ No encontrado: ${baseName}.ts`);
    continue;
  }

  // Leemos el contenido del .ts como texto.
  const raw = fs.readFileSync(sourceFile, 'utf8');

  // Lo guardamos tal cual, pero con extensión .js.
  // Aquí no necesitamos "compilar" nada porque el seed solo lo lee como texto.
  fs.writeFileSync(destFile, raw, 'utf8');

  // Mostramos qué archivo se ha preparado.
  console.log(`✓ ${baseName}.ts  ->  ${baseName}.js`);

  // Sumamos uno al contador.
  ok++;
}

// Resumen final.
console.log(`\n✅ ${ok}/${FILES_NEEDED.length} archivos preparados en showdown-data/`);
console.log('   Ahora ejecuta: node src/db/seed.js\n');
