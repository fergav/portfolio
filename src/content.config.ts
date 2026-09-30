import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const categorias = defineCollection({
  // categorias.json es un arreglo; el `slug` de cada entrada es su id.
  loader: file('src/content/categorias.json', {
    parser: (texto) =>
      JSON.parse(texto).map((c: { slug: string }) => ({ id: c.slug, ...c })),
  }),
  schema: z.object({
    slug: z.string(),
    nombre: z.string(),
    orden: z.number(),
  }),
});

const proyectos = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/proyectos' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      // Opcional: si falta, la tarjeta no muestra fecha.
      fecha: z.coerce.date().optional(),
      descripcion: z.string().optional(),
      categoria: reference('categorias'),
      // Si hay video, la imagen es su póster (primer cuadro que se ve).
      imagen: image(),
      video: z.string().optional(),
      // Con video: parte solo en loop y sin sonido (botón para activarlo). Sin esto: play, sonido y pantalla completa.
      autoplay: z.boolean().optional(),
      // Imágenes muy altas: llenan el ancho del recuadro y se recorren con scroll vertical.
      desplazable: z.boolean().optional(),
      // Varias láminas (carpeta paginas/, y el video primero si hay): se hojean con flechas.
      paginado: z.boolean().optional(),
      // Con paginado: oculta el contador de páginas ("1 / 10") y deja solo las flechas.
      sinContador: z.boolean().optional(),
      imagenAlt: z.string(),
      orden: z.number(),
    }),
});

export const collections = { categorias, proyectos };
