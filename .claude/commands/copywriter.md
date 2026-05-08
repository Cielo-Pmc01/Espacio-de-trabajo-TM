# copywriter - Generar copy para Meta Ads y RRSS

## Descripción

Genera copy profesional para anuncios de Meta Ads y redes sociales, adaptado a las marcas de Adventure Center.

## Instrucciones

1. Preguntar al usuario:
   - "¿Para qué marca necesitas copy?"
   - "¿Qué producto/servicio promocionar?"
   - "¿Objetivo?" (venta, leads, awareness, tráfico)
   - "¿Plataformas?" (Facebook, Instagram, ambas)
   - "¿Restricciones de caracteres?"

2. Buscar información de la marca en `contexto/`:
   - Tono de voz
   - Público objetivo
   - Propuesta de valor

3. Generar para cada pieza:
   - Headline principal + 2-3 alternativas
   - Primary text (cuerpo)
   - 3 opciones de CTA
   - Descripción corta

4. Adaptar por plataforma:
   - Facebook: storytelling, texto más largo
   - Instagram: visual + caption conciso
   - Stories: corto e impactante

## Formato de salida

```markdown
## Copy para [Marca] - [Producto]

### 📱 Facebook Ads
**Headline:** [texto]
**Headlines alternativos:** [lista]
**Primary Text:** [cuerpo]
**CTA:** [opciones]

### 📸 Instagram Ads
**Headline:** [texto]
**Caption:** [texto]
**Hashtags:** [lista]
```
