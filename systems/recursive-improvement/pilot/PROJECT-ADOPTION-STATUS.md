# Project adoption registry status

SparkTech is intended to provide the reusable improvement and outreach
workflows. Each adopting company keeps its own repo, runtime, package pin,
data, credentials, goals, budgets, permissions, evidence and rollback.
Registry entries grant no access. Nothing here installs software into another
company repository.

## Verified local identity

| Project | Local identity evidence | Current SparkTech status |
|---|---|---|
| Spacial Health SCI | Read-only `spacial-health/README.md` identifies the SCI demo as a Utah allergy/immunology practice product, sample data only; real patient use needs secure services, authentication, audit, HIPAA controls and clinical governance. | Disabled example in `companies/spacial-health.example.json`; synthetic fixtures only. No patient data, clinical decisions, advice, safety instructions, outbound patient messages, or release. |

## Additional verified local identities

The following mappings were provided by the owner and checked against their
read-only local README files. The SparkTech examples remain disabled; this
registry does not install into or modify those repositories.

| Project | Local README evidence | SparkTech boundary |
|---|---|---|
| ThreadFit | `/Users/shoberman/clothes/README.md` identifies ThreadFit, a men's AI stylist and shopper. Repository reference: `https://github.com/Shoberman2/mensclothing`. | Disabled synthetic-only profile. No personal account/order data, purchases, checkout, inventory claims, or retailer actions. |
| ArtStory | `/Users/shoberman/artStory/README.md` identifies an AI-guided art companion and Met Open Access as a proposed museum pilot source. Repository reference: `https://github.com/Shoberman2/artStory`. | Disabled. No network/API or publishing; public-domain source scope and all interpretive content require owner/curator review. No Supabase/OpenAI credentials or calls. |
| Allergy Copilot | `/Users/shoberman/foodAllergyApp/README.md` identifies a separate iOS food-allergy app with evidence labels and synthetic Mock Mode. Repository reference: `https://github.com/Shoberman2/allergyApp`. | Disabled synthetic-only. No patient/profile data, live food-safety advice, image upload, clinical decisions, or provider/model calls. This remains separate from Spacial Health. |
| The Highest / Cherry Picked | `/Users/shoberman/weedcomp/README.md` identifies Cherry Picked and describes a current High Times direction; it says no signed High Times agreement exists. Repository reference: `https://github.com/Shoberman2/comp`. | Disabled. Draft/action tracking and public-source review only after separate approval; no partner access, licensing assumption, transactions, purchase facilitation, or publishing. |

These local README files were inspected read-only. Public GitHub page retrieval
was not independently confirmed in this task. “ArtMuseum” is not a separate
verified product name; ArtStory is the repository identity. Allergy Copilot
and Spacial Health are distinct projects.

## Shared workflow control model

For each confirmed project, the owner-specific manifest should allow only
named local files, fixtures and tests; prohibit unapproved APIs, sends,
deployment and secrets; require a named owner to approve an exact source/config
hash before a bounded cycle; require independent verification and evidence;
and record a rollback path. A company may install a reviewed pinned SparkTech
package in its own runtime only after its owner sets it up. Version `0.1.0` is
the current source version, not a published package. Never centralize private
company or customer datasets in SparkTech.

For healthcare projects, only synthetic fixtures are allowed until the
company has separately established its security, privacy, clinical review,
and compliance controls. Clinical judgments, diagnosis, triage, medical advice,
safety guidance and patient-data transmission stay outside autonomous actions.
