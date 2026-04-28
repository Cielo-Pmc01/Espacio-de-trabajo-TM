# 🚀 Guía de Automatización y Diseño de Redes Sociales

Esta guía explica cómo utilizamos **Trae + HTML/Tailwind + n8n** para crear un sistema de diseño profesional, automatizado y fácil de retocar para las 14 marcas de turismo.

---

## 1. El Concepto: "Diseño por Código"
En lugar de usar Canva o Photoshop (que son difíciles de automatizar), usamos **HTML y Tailwind CSS**.
- **Ventaja para vos:** Podés pedirme "cambiá el color a rojo" o "hacé el texto más grande" y yo lo hago en segundos editando el código.
- **Ventaja para la automatización:** n8n puede tomar este código, cambiar los precios y fotos automáticamente, y generar una imagen (JPG/PNG).

## 2. Cómo Trabajamos Juntos (El Flujo)

### A. Creación del Diseño
1.  **Yo creo un Template:** Como el que acabo de crear en `templates/template_square_offer.html`.
2.  **Vos lo revisás:** Podés abrir el archivo `.html` en cualquier navegador para ver cómo queda.
3.  **Retoque:** Si algo no te gusta, me decís: *"Trae, en el template de ofertas, subí un poco el logo y poné el precio en amarillo"*. Yo edito el código y listo.

### B. Automatización con n8n
Para que esto funcione solo, configuramos un flujo en n8n que:
1.  **Lee los Datos:** Obtiene los precios de `marketing/catalog_excursions.md`.
2.  **Inyecta los Datos:** Reemplaza el texto en el HTML (ej: cambia `{{PRECIO}}` por `$25.000`).
3.  **Genera la Imagen:** Usa un nodo de "HTML to Image" (o un servicio como Bannerbear/Placid).
4.  **Publica:** Envía la imagen a Instagram/Facebook/WhatsApp.

---

## 3. Comandos de "Retoque" que podés usar
Podés pedirme cosas específicas como:
- *"Trae, hacé una versión para Historias (9:16) de este post."*
- *"Cambiá la tipografía a una más elegante."*
- *"Agregá un sticker de 'Últimos Cupos' en la esquina superior derecha."*
- *"Aplicá este mismo diseño pero con los colores de la marca 'Línea Rafting'."*

---

## 4. Próximos Pasos
1.  **Verificación:** Abrí [template_square_offer.html](file:///d:/Elementor_Project_Workflow-master/Elementor_Project_Workflow-master/marketing/social_media/templates/template_square_offer.html) en tu navegador.
2.  **Feedback:** Decime qué retoques querés hacerle a este primer diseño.
3.  **n8n:** Cuando estés listo, configuramos el nodo de n8n para que empiece a generar estos posts con datos reales.
