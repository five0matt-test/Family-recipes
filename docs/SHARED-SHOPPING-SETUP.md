# Shared household shopping list

The existing Firebase Spark project is reused. There is no new paid service, backend or API key. Firestore reads/writes count toward the project's existing free quotas; quota availability is not guaranteed.

One shared list lives at `households/family/shopping/current`, separate from `households/family/pantry`. The site never deducts inventory. Recipes, quantities, extras, purchase checks, and manual review choices sync when shared mode is selected. Each browser remembers that choice for the signed-in UID. Existing browser lists remain separate; the explicit import button adds missing recipe selections/extras without replacing shared quantities or importing old purchase checks.

## Enable permissions

Repository access does not grant Firebase Console administrator access. Live rules were not read or deployed during development. If the household's existing rules already grant matching access recursively, no change may be needed. Otherwise:

1. Open Firebase Console → family-recipes-pantry → Firestore Database → Rules.
2. Preserve the existing pantry rules and the exact household UID allowlist.
3. Add a match block for `/households/family/shopping/current` inside `/databases/{database}/documents`. In the example below, `isHouseholdMember()` means **the same verified three-person membership check already protecting the pantry**. Reuse that function if it exists, or define it using the existing UID allowlist. Do not grant access to every signed-in Google account.
4. Test signed-out and unrelated UIDs are denied; test each household UID can get/create/update the shared record. Publish the rules only after these checks.

```text
match /households/family/shopping/current {
  allow get: if isHouseholdMember();
  allow create: if isHouseholdMember()
    && validShoppingList()
    && request.resource.data.revision == 1;
  allow update: if isHouseholdMember()
    && validShoppingList()
    && request.resource.data.revision == resource.data.revision + 1;
  allow delete, list: if false;
}
function validShoppingList() {
  let d = request.resource.data;
  return d.keys().hasAll(['version', 'revision', 'plan', 'applied', 'updatedBy', 'updatedAt'])
    && d.keys().hasOnly(['version', 'revision', 'plan', 'applied', 'updatedBy', 'updatedAt'])
    && d.version == 1
    && d.revision is int && d.revision > 0
    && d.plan is string && d.plan.size() <= 500000
    && d.applied is list && d.applied.size() <= 100
    && d.updatedBy == request.auth.uid
    && d.updatedAt == request.time;
}
```

This is an additive template, **not a replacement ruleset**. Rules grant access if *any* matching allow expression succeeds; a broad existing allow can override a restrictive block. Review overlapping matches. The example does not authorize subcollections, document enumeration, or deletion. Clearing the list saves an empty state instead of deleting the document. Client validation handles the JSON plan's bounded recipe IDs, quantities, strings, and arrays; rules restrict membership, envelope size and revision. Household members are trusted to edit the shared list.

## Behavior and recovery

- Select **Use shared household list** on each device after Google sign-in. Shared mode waits for an authoritative server read, including when the record does not yet exist. Opening it never creates an empty record or uploads an old browser list.
- Writes use Firestore transactions and item-level intent patches. Changes to different items survive concurrent saves. If two people change the same item/setting, the last committed intent wins. Clear affects the whole household and requires confirmation.
- Offline/failed saves show **Not synced**. Pending edits are backed up in the current browser for that UID, and Retry sends them. Outbox operation IDs make a lost commit reply safe to retry (last 100 operation IDs are retained). Keep one editing tab per browser while offline; the browser's outbox backup is shared by its tabs.
- If browser storage is blocked, pending edits survive only while the page remains open. Download a backup before leaving. Returning to browser-only mode leaves shared pending edits separately for the next shared session.
- Signed-out users cannot see the shopping section; account changes unsubscribe the old shared listener. No household identifiers or credentials are stored in the list. Google sign-in and Firestore rules remain the security boundary.
- Pantry comparison is still an estimate. Outdated inventory produces outdated shortages. When recipes or pantry stock change, manual review choices reset; purchase checks survive only for unchanged required amounts.

## Validation and remaining release checks

Local tests use isolated Firebase fixtures, never real household inventory. They cover concurrent devices, checks, migration, retry after offline/reload, lost replies, sign-out, permission denial and mobile layout. Live rule deployment, real authorized/unauthorized account tests, and physical iPhone/Safari checks remain release checks. No fake records were added to the live household.
