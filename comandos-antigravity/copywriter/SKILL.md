# copywriter

## Descripción

Genera copy profesional para Meta Ads (Facebook/Instagram) adaptado a las marcas de Adventure Center.

## Cuándo usar

- Cuando necesitas copy para campañas pagadas
- Para crear anuncios de Meta Ads
- Para generar contenido de RRSS con enfoque conversión

## Parámetros

- **marca** (requerido): Nombre de la marca (ej: Tierra Maya, Adventure Center, etc.)
- **producto** (requerido): Producto o servicio a promocionar
- **objetivo** (opcional): venta, leads, awareness, tráfico (default: venta)
- **plataforma** (opcional): facebook, instagram, ambas (default: ambas)
- **tono** (opcional): descripción del tono deseado
- **max-caracteres** (opcional): límite de caracteres si aplica

## Instrucciones

1. Preguntar marca, producto y objetivo si no se proporcionan
2. Buscar información de marca en `contexto/`:
   - Tono de voz
   - Público objetivo
   - Propuesta de valor única
3. Generar copy completo:
   - Headline principal (atención + beneficio)
   - 2-3 headlines alternativos
   - Primary text/cuerpo (estructura AIDA o PAS)
   - 3 opciones de CTA diferentes
   - Descripción corta para anuncios
4. Adaptar por plataforma:
   - **Facebook:** storytelling, texto más largo permitido
   - **Instagram:** visual + caption conciso, hashtags
   - **Stories/Reels:** corto, impactante, swipe-up CTA
5. Optimizar para conversión:
   - Power words del nicho turismo/aventura
   - Urgencia o escasez si aplica
   - Beneficios sobre características
   - Social proof cuando disponible

## Formato de salida

```markdown
## Copy para [Marca] - [Producto]

### 📱 Facebook Ads
**Headline:** [texto principal]

**Headlines alternativos:**
1. [Alternativa 1]
2. [Alternativa 2]
3. [Alternativa 3]

**Primary Text:**
[Cuerpo del anuncio]

**CTA:**
- [Opción 1]
- [Opción 2]
- [Opción 3]

### 📸 Instagram Ads
**Headline:** [texto adaptado]

**Caption:**
[Texto para feed]

**Hashtags:**
[#hashtag1 #hashtag2 #hashtag3]

### 📊 Especificaciones
- Caracteres headline: [X/Y]
- Caracteres primary text: [X/Y]
- Recomendación creativo: [tipo imagen/video]
```

## Ejemplo de uso

```
/copywriter marca:"Tierra Maya" producto:"Tour Chichen Itza" objetivo:venta plataforma:ambas
```

O escribe: "Genera copy para [marca] promocionando [producto]"
