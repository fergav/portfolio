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
      // Opcional mientras el diseñador no entregue las fechas.
      fecha: z.coerce.date().optional(),
      descripcion: z.string().optional(),
      categoria: reference('categorias'),
      // Si hay video, la imagen es su póster (primer cuadro que se ve).
      imagen: image(),
      video: z.string().optional(),
      // Imágenes muy altas: llenan el ancho del recuadro y se recorren con scroll vertical.
      desplazable: z.boolean().optional(),
      // Varias láminas (carpeta paginas/, y el video primero si hay): se hojean con flechas.
      paginado: z.boolean().optional(),
      imagenAlt: z.string(),
      orden: z.number(),
    }),
});

export const collections = { categorias, proyectos };
