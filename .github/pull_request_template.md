## Summary

<!-- Explain what changed and why. -->

## Change type

- [ ] Security or access control
- [ ] Database migration or RLS
- [ ] Billing or Stripe
- [ ] Application feature or fix
- [ ] Build, dependency or deployment
- [ ] Documentation only

## Validation

- [ ] `npm ci`
- [ ] `npm run check:repo`
- [ ] `npm run check:migrations`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`

## Database and deployment

- [ ] No database change is required.
- [ ] Migration files are included and ordered correctly.
- [ ] Required environment variables or Edge Function secrets are documented.
- [ ] Rollback steps are documented for operational changes.

## Security review

- [ ] No environment file, service-role key, private key or production secret is committed.
- [ ] Authentication and role checks fail closed.
- [ ] Browser code does not assign trusted roles, plans, trials or payment state.
- [ ] New data access is protected by appropriate RLS or server-side authorisation.

## Stacked pull request

<!-- Delete this section for a normal PR. -->

- Base branch:
- Required earlier PR:
- Merge order:
