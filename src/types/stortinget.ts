import { type Politician, type Party, type Case, type Vote, PoliticianRole, CaseTopic, Committee } from "@prisma/client";

export type PoliticianWithRelations = Politician & {
  party: Party;
  votes: Vote[];
  roles: PoliticianRole[];
};

export type PartyWithRelations = Party & {
  politicians: Politician[];
};

export type CaseWithRelations = Case & {
  votes: Vote[];
  topics: CaseTopic[];
  committee: Committee | null;
};

export type VoteWithRelations = Vote & {
  politician: Politician;
  case: Case;
};