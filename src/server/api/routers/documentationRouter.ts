import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const PublicationReference = z.object({
  eksport_id: z.string().nullable(),
  type: z.number(),
  lenke_tekst: z.string(),
  lenke_url: z.string(),
  undertype: z.string().nullable(),
});

const CaseResponse = z.object({
  publikasjon_referanse_liste: z.array(PublicationReference),
});

type CaseResponseType = z.infer<typeof CaseResponse>;

export const documentRouter = createTRPCRouter({
  getDocumentIds: publicProcedure
    .input(z.object({ stortingetId: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        `https://data.stortinget.no/eksport/sak?sakid=${input.stortingetId}&format=json`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch case data");
      }

      // Explicit type assertion for response.json()
      const data = (await response.json()) as CaseResponseType;

      // Validate with Zod
      const parsedData = CaseResponse.parse(data);

      // Deduplicate by eksport_id
      const uniqueDocs = parsedData.publikasjon_referanse_liste.reduce<
        Record<string, { id: string; text: string; type: number }>
      >((acc, ref) => {
        if (ref.eksport_id) {
          acc[ref.eksport_id] = {
            id: ref.eksport_id,
            text: ref.lenke_tekst,
            type: ref.type,
          };
        }
        return acc;
      }, {});

      return {
        documentIds: Object.values(uniqueDocs),
      };
    }),
});