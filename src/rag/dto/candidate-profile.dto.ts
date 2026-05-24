export class CandidateProfileDto {
  constructor(
    public readonly birthCountry: string,

    public readonly birthCity: string,

    public readonly gender: string,

    public readonly personalContext: string,
  ) {}
}