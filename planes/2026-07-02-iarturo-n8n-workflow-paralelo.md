# Plan: IArturo (Sofía IA) — Workflow n8n en Paralelo con Notion

**Fecha:** 2026-07-02
**Estado:** Pendiente
**Proyecto:** capacitacion-tm

## Contexto y Justificación

IArturo (nombrado "Sofía" en el producto) es el tutor IA de `capacitacion-tm`. Hoy vive
100% en código: [`app/routes/alumno-sofia-chat.tsx`](../salidas/capacitacion-tm/app/routes/alumno-sofia-chat.tsx)
hace RAG contra `capacitacion_tm.embeddings` (pgvector, OpenAI `text-embedding-3-small`)
y llama al LLM vía `getLLMClient()` con un system prompt fijo (`SOFIA_SYSTEM`).

Cielo quiere poder **entrenarlo más fácil**: sumar más fuentes de datos (Notion, además
de la base de capacitación) y poder ajustar el comportamiento/prompt sin depender de un
deploy de código. La forma elegida es armar un **workflow n8n en paralelo**, en una
**instancia nueva y separada** de Magda (el otro sistema n8n de la empresa, crítico y en
producción — no se toca ni se mezcla).

Esto es un **experimento validado en paralelo**: el endpoint actual de la app sigue
funcionando exactamente igual. Reemplazarlo por el webhook de n8n es una decisión futura,
fuera de este plan, que se toma después de comparar resultados.

## Alcance

**Incluye:**
- Diseño del workflow n8n (nodos, flujo de datos, credenciales necesarias).
- JSON exportable del workflow para importar en n8n.
- Recolección de los datos pendientes (instancia n8n, credenciales Notion) como tareas
  explícitas con Cielo — no se asumen.
- Método simple de prueba en paralelo (sin tocar la app).
- Documentación de setup en el repo.

**NO incluye:**
- Modificar `alumno-sofia-chat.tsx` ni el flujo real de producción.
- Migrar embeddings existentes a n8n (se reutiliza la tabla `capacitacion_tm.embeddings`
  y la RPC `match_embeddings` ya existentes).
- Tocar cualquier workflow de Magda.
- Decidir si n8n reemplaza al endpoint actual (queda para un plan futuro).

## Arquitectura / Decisiones Técnicas

**Instancia n8n:** nueva y separada de la de Magda. Self-hosted vs n8n.cloud es decisión
de Cielo (tarea 1) — el diseño del workflow es igual en ambos casos.

**Contrato de entrada/salida:** el webhook replica el contrato actual de
`alumno-sofia-chat.tsx` para que un reemplazo futuro sea un simple cambio de URL:
- Entrada: `{ question: string, sector: string | null, messages: {role, content}[] }`
- Salida: `{ ok: boolean, answer: string, citations: {lesson_id, title, module_title}[] }`

**Flujo de nodos:**
1. **Webhook** (POST `/iarturo-test`) — recibe `question`, `sector`, `messages`.
2. **HTTP Request — Embedding** — `POST https://api.openai.com/v1/embeddings` con
   `text-embedding-3-small` sobre `question` (credencial OpenAI API key).
3. **Supabase / Postgres — RPC `match_embeddings`** — mismo RPC que usa hoy la app,
   filtrando por `sector`. Usa credencial Postgres (host/pass de Supabase, ya existen en
   `.env.local` — se cargan como credencial nueva en n8n, no se reusan desde el repo).
4. **Notion — Search/Query database** — busca contenido relevante en la(s) base(s) de
   Notion que Cielo indique (tarea 2). Requiere integración Notion con permiso de
   lectura sobre esas páginas/bases.
5. **Code — Merge contexto** — combina los resultados de Supabase y Notion en el mismo
   formato de bloques `[Fuente N] "título" — módulo\ntexto` que arma hoy
   `alumno-sofia-chat.tsx`, filtrando por similarity > 0.2 igual que el código actual.
6. **LLM Chat (OpenAI/Anthropic node)** — mismo `SOFIA_SYSTEM` (copiado literal del
   archivo actual) + contexto armado + historial (`messages.slice(-6)`) + `question`.
7. **Code — Parseo de citas** — extrae `<citas>[...]</citas>` del output y arma
   `{answer, citations}` igual que la lógica actual en TS.
8. **Respond to Webhook** — devuelve `{ok: true, answer, citations}`.

**Credenciales que necesita la instancia n8n (nuevas, no compartir con Magda):**
- OpenAI API key (embeddings + chat)
- Supabase Postgres (host, user, password, `capacitacion_tm` schema) — solo lectura vía RPC
- Notion Internal Integration Token + IDs de página/base compartidos con la integración

**Prueba en paralelo (sin tocar la app):** curl/Postman contra la Webhook test URL de
n8n, con el mismo payload que envía el FAB de Sofía hoy. Comparar respuesta contra
pegarle directamente a `/alumno/sofia/chat` con la misma pregunta.

## Tareas

- [x] 1. Instancia n8n confirmada: https://n8ntm.iadventurecentersx.com/home (ya existe,
      separada de la de Magda). Se usa esta URL para importar el workflow.
- [x] 2. Fuente Notion confirmada: página "Casos Específicos" dentro de la hoja
      "Protocolo Generales de Atención al Pasajero", en el workspace de SP. Falta que
      Cielo comparta esa página con la integración interna de Notion antes del paso 5
      (si la integración de Notion todavía no existe, crearla en
      notion.so/my-integrations y compartir la página desde "..." → Connections).
- [x] 3. JSON del workflow escrito en `salidas/capacitacion-tm/n8n/iarturo-rag-workflow.json`
      (13 nodos: Webhook → normalizar → config → embedding → Supabase RPC → Notion →
      merge de contexto con `SOFIA_SYSTEM` literal → LLM → parseo de citas → respuesta).
      Validado como JSON bien formado.
- [x] 4. `salidas/capacitacion-tm/n8n/README.md` escrito con: cómo importar, las 3
      credenciales a crear (nombres exactos), cómo generar el token de Notion y
      compartir la página, cómo completar el nodo Config, y comandos de prueba.
- [ ] 5. Cielo importa el workflow en https://n8ntm.iadventurecentersx.com/home, crea las
      3 credenciales y completa el nodo Config (supabase_url + notion_page_id).
- [ ] 6. Probar con 3-5 preguntas ya usadas para validar IArturo (Catedral, Circuito
      chico, protocolo de pick ups, proveedores, y algo específico de "Casos
      Específicos" en Notion) comparando respuesta de n8n vs. la app actual.
- [ ] 7. Registrar resultado de la prueba (funcionó / qué falló) en memoria del proyecto
      y decidir próximos pasos (sumar más fuentes, ajustar prompt, o evaluar reemplazo
      del endpoint real en un plan futuro).

## Criterio de Éxito

- El workflow importado responde con `{ok, answer, citations}` para una pregunta de
  prueba, combinando contexto de Supabase (capacitación) y Notion.
- Las respuestas para las mismas preguntas son comparables en calidad a las del endpoint
  actual (sin alucinar, con citas).
- El endpoint real de la app (`alumno-sofia-chat.tsx`) sigue funcionando sin cambios.
- No hay ninguna credencial ni webhook compartido con la instancia/workflows de Magda.

## Notas / Riesgos

- El JSON de n8n se escribe a mano en esta sesión (sin acceso MCP a un n8n corriendo);
  al importarlo puede necesitar ajustes menores de versión de nodo dentro del editor de
  Cielo — normal, no invalida el diseño.
- Notion API tiene rate limits y requiere compartir explícitamente cada página/base con
  la integración — sin ese paso el nodo Notion devuelve vacío/403.
- Cielo está aprendiendo n8n (ver memoria `user_cielo`) — el README debe ser paso a paso,
  sin asumir experiencia previa con la herramienta.
- Mantener esto completamente aislado de Magda: nueva instancia, nuevas credenciales,
  ningún workflow ni nodo compartido.
