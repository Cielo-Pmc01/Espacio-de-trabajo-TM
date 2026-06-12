/**
 * migrate-excursions.mjs
 *
 * Lee catalog_invierno.md, parsea todas las excursiones activas
 * y genera un archivo SQL con el UPDATE para Supabase.
 *
 * Uso: node scripts/migrate-excursions.mjs
 * Output: scripts/migration-excursions.sql
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalogPath = join(__dirname, '../contexto/negocio/catalog_invierno.md');
const outputPath = join(__dirname, 'migration-excursions.sql');

// --- Provider mapping ---
const CATEGORY_PROVIDER_MAP = {
  'EXCURSIONES TERRESTRES': 'Adventure Center',
  'SKI & SNOW': 'Cerro Catedral / Travesía',
  'NIEVE & REFUGIOS': 'Refugio Neumeyer',
  'PIEDRAS BLANCAS': 'Piedras Blancas',
  'WINTER PARK': 'Winter Park',
  'LA CUEVA': 'La Cueva',
  'AVENTURA EN LA NIEVE': 'Tren Patagónico',
  'CENA NÓRDICA': 'Ski Nórdico Cerro Otto',
};

const TITLE_PROVIDER_OVERRIDES = {
  'ROCA NEGRA': 'Cerro López',
  'NOCHE ENCANTADA': 'Cerro López',
  'NIEVE ENCANTADA': 'Cerro López',
  'CULIPATÍN — TRINEOS EN CERRO': 'Cerro López',
  'LAGUNA CONGELADA': 'Refugio Neumeyer',
  'VIVENCIAS': 'Refugio Neumeyer',
};

const CATEGORY_CLEAN_MAP = {
  'EXCURSIONES TERRESTRES DE INVIERNO': 'Terrestres',
  'SKI & SNOW': 'Ski & Snow',
  'NIEVE & REFUGIOS': 'Nieve y Refugios',
  'PIEDRAS BLANCAS': 'Piedras Blancas',
  'WINTER PARK': 'Winter Park',
  'LA CUEVA — CERRO CATEDRAL': 'La Cueva',
  'LA CUEVA - CERRO CATEDRAL': 'La Cueva',
  'AVENTURA EN LA NIEVE': 'Aventura',
  'CENA NÓRDICA': 'Gastronomía',
};

const SKIP_CATEGORIES = [
  'TABLA SEÑA', 'SERVICIOS ADICIONALES', 'EXCURSIONES SUSPENDIDAS'
];

// --- Block/Lesson IDs in Supabase ---
const BLOCK_ID = 'ea2253f5-23a1-4f5d-a133-93a694b48115';

// --- Helpers ---
function findProvider(title, rawCategory) {
  const upperTitle = title.toUpperCase();
  for (const [key, value] of Object.entries(TITLE_PROVIDER_OVERRIDES)) {
    if (upperTitle.includes(key)) return value;
  }
  for (const [key, value] of Object.entries(CATEGORY_PROVIDER_MAP)) {
    if (rawCategory.toUpperCase().includes(key)) return value;
  }
  return 'Adventure Center';
}

function cleanCategory(rawCategory) {
  for (const [key, value] of Object.entries(CATEGORY_CLEAN_MAP)) {
    if (rawCategory.toUpperCase().includes(key.toUpperCase())) return value;
  }
  return rawCategory;
}

function isSectionHeader(line) {
  return /^\*\*[A-ZÁÉÍÓÚÑ\s]+\*\*/.test(line);
}

function getSectionKey(line) {
  const match = line.match(/^\*\*([^*]+)\*\*/);
  if (!match) return null;
  const section = match[1].trim().toUpperCase();
  if (section.includes('SALIDA')) return 'departures';
  if (section.includes('RECORRIDO') || section.includes('DESCRIPCI')) return 'description';
  if (section.includes('LUGAR DE ENCUENTRO') || section.includes('PUNTO DE ENCUENTRO') || section.includes('PUNTO DE BÚSQUEDA')) return 'meetingPoint';
  if (section.includes('NO INCLUYE')) return 'notIncludes';
  if (section.includes('INCLUYE')) return 'includes';
  if (section.includes('FORMAS DE PAGO') || section.includes('PRECIO')) return 'skip';
  if (section.includes('IMPORTANT')) return 'important';
  return 'skip';
}

// --- Parse markdown ---
function parseCatalog(content) {
  const lines = content.split('\n');
  const excursions = [];
  let currentCategory = '';
  let currentExcursion = null;
  let currentSection = '';
  let skipCategory = false;

  function save() {
    if (currentExcursion && currentExcursion.title) {
      excursions.push({ ...currentExcursion });
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // H1: skip
    if (line.startsWith('# ') && !line.startsWith('## ')) continue;

    // H2: category
    if (line.startsWith('## ')) {
      save();
      currentExcursion = null;
      currentSection = '';
      currentCategory = line.replace(/^## /, '');
      skipCategory = SKIP_CATEGORIES.some(skip => currentCategory.toUpperCase().includes(skip));
      continue;
    }

    // H3: excursion
    if (line.startsWith('### ')) {
      if (skipCategory) continue;
      save();
      const title = line.replace(/^### /, '');
      currentExcursion = {
        title,
        category: cleanCategory(currentCategory),
        provider: findProvider(title, currentCategory),
        schedule: '',
        departures: '',
        meetingPoint: '',
        description: [],
        includes: [],
        notIncludes: [],
        important: [],
      };
      currentSection = '';
      continue;
    }

    if (!currentExcursion || skipCategory) continue;
    if (line === '---' || line === '') continue;

    // Section headers
    if (isSectionHeader(line)) {
      currentSection = getSectionKey(line) || 'skip';
      continue;
    }

    if (currentSection === 'skip') continue;

    // Schedule line (🕘)
    if (line.includes('🕘')) {
      currentExcursion.schedule = line.replace('🕘', '').trim();
      continue;
    }

    // Season/age info → skip (not main content)
    if (line.includes('Periodo del año') || line.includes('Período del año')) continue;
    if (line.startsWith('Edad mínima') || line.startsWith('Edad')) continue;
    if (line.startsWith('💰') || line.startsWith('💳') || line.startsWith('$') || line.startsWith('Adulto') || line.startsWith('Menor') || line.startsWith('Infante')) continue;

    // Skip emoji-only lines
    if (/^[\p{Emoji}\s]+$/u.test(line) && line.length < 10) continue;

    // Content by section
    switch (currentSection) {
      case 'departures':
        if (currentExcursion.departures) {
          currentExcursion.departures += '. ' + line;
        } else {
          currentExcursion.departures = line;
        }
        break;
      case 'description':
        currentExcursion.description.push(line);
        break;
      case 'meetingPoint':
        if (currentExcursion.meetingPoint) {
          currentExcursion.meetingPoint += ' ' + line;
        } else {
          currentExcursion.meetingPoint = line;
        }
        break;
      case 'includes':
        currentExcursion.includes.push(line);
        break;
      case 'notIncludes':
        currentExcursion.notIncludes.push(line);
        break;
      case 'important':
        currentExcursion.important.push(line);
        break;
    }
  }

  save();
  return excursions;
}

// --- Tiptap JSON builders ---
function tiptapHeading(text, level) {
  return {
    type: 'heading',
    attrs: { level },
    content: [{ type: 'text', text: text.trim() }]
  };
}

function tiptapParagraph(text) {
  return {
    type: 'paragraph',
    content: [{ type: 'text', text: text.trim() }]
  };
}

function tiptapBulletList(items) {
  return {
    type: 'bulletList',
    content: items
      .filter(i => i && i.trim().length > 0)
      .map(item => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: item.trim() }] }]
      }))
  };
}

function buildExcursionDoc(excursions) {
  const content = [];

  for (const exc of excursions) {
    content.push(tiptapHeading(exc.title, 2));

    if (exc.category) content.push(tiptapParagraph(`Categoría: ${exc.category}`));
    if (exc.provider) content.push(tiptapParagraph(`Proveedor: ${exc.provider}`));
    if (exc.schedule) content.push(tiptapParagraph(`Duración: ${exc.schedule}`));
    if (exc.departures) content.push(tiptapParagraph(`Salida: ${exc.departures}`));
    if (exc.meetingPoint) content.push(tiptapParagraph(`Pick up: ${exc.meetingPoint}`));

    if (exc.description.length > 0) {
      content.push(tiptapHeading('Itinerario', 3));
      content.push(tiptapBulletList(exc.description));
    }

    if (exc.includes.length > 0) {
      content.push(tiptapHeading('Incluye', 3));
      content.push(tiptapBulletList(exc.includes));
    }

    if (exc.notIncludes.length > 0) {
      content.push(tiptapHeading('No incluye', 3));
      content.push(tiptapBulletList(exc.notIncludes));
    }

    if (exc.important.length > 0) {
      content.push(tiptapHeading('Importante', 3));
      content.push(tiptapBulletList(exc.important));
    }
  }

  return {
    type: 'doc',
    content
  };
}

function buildProvidersDoc(excursions) {
  // Group by provider
  const grouped = new Map();
  for (const exc of excursions) {
    const prov = exc.provider || 'Adventure Center';
    if (!grouped.has(prov)) grouped.set(prov, []);
    grouped.get(prov).push(exc.title);
  }

  const content = [];
  const sortedProviders = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  for (const [provider, excursionTitles] of sortedProviders) {
    content.push(tiptapHeading(provider, 2));
    content.push(tiptapParagraph(`Proveedor: ${provider}`));
    content.push(tiptapHeading('Excursiones que ofrece', 3));
    content.push(tiptapBulletList(excursionTitles));
  }

  return { type: 'doc', content };
}

// --- Generate SQL ---
function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

function generateSQL(excursionDoc, providersDoc) {
  const excursionJson = JSON.stringify({ tiptap: excursionDoc, blocks: [] });
  const providersJson = JSON.stringify({ tiptap: providersDoc, blocks: [] });

  return `-- ============================================================
-- Migration: Catálogo de Excursiones y Directorio de Proveedores
-- Fecha: ${new Date().toISOString().split('T')[0]}
-- Proyecto: capacitacion-tm
-- Block ID: ${BLOCK_ID}
-- ============================================================

-- 1. Actualizar lección de Excursiones de Invierno
UPDATE capacitacion_tm.lessons
SET
  content_json = '${escapeSQL(excursionJson)}'::jsonb,
  lesson_type = 'excursion',
  updated_at = NOW()
WHERE title ILIKE '%excursion%'
  AND block_id = '${BLOCK_ID}';

-- Si la lección NO existe, crearla:
-- INSERT INTO capacitacion_tm.lessons (title, block_id, lesson_type, content_json, is_published, "order")
-- VALUES (
--   'Excursiones de Invierno 2026',
--   '${BLOCK_ID}',
--   'excursion',
--   '${escapeSQL(excursionJson)}'::jsonb,
--   true,
--   1
-- );

-- 2. Actualizar lección de Directorio de Proveedores
UPDATE capacitacion_tm.lessons
SET
  content_json = '${escapeSQL(providersJson)}'::jsonb,
  lesson_type = 'provider',
  updated_at = NOW()
WHERE (title ILIKE '%proveedor%' OR title ILIKE '%directorio%')
  AND block_id = '${BLOCK_ID}';

-- Si la lección NO existe, crearla:
-- INSERT INTO capacitacion_tm.lessons (title, block_id, lesson_type, content_json, is_published, "order")
-- VALUES (
--   'Directorio de Proveedores — Invierno',
--   '${BLOCK_ID}',
--   'provider',
--   '${escapeSQL(providersJson)}'::jsonb,
--   true,
--   2
-- );
`;
}

// --- Main ---
const content = readFileSync(catalogPath, 'utf-8');
const excursions = parseCatalog(content);

console.log(`\n✅ Excursiones parseadas: ${excursions.length}`);
console.log('');
excursions.forEach((e, i) => {
  console.log(`  ${i + 1}. [${e.category}] ${e.title} → ${e.provider}`);
});

const excursionDoc = buildExcursionDoc(excursions);
const providersDoc = buildProvidersDoc(excursions);
const sql = generateSQL(excursionDoc, providersDoc);

writeFileSync(outputPath, sql, 'utf-8');
console.log(`\n📄 SQL generado: ${outputPath}`);
console.log('   → Pegar en Supabase SQL Editor y ejecutar.');
