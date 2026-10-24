# GreenMaster Go illustration: research

Research for the "paper report becomes rows" figure in the GreenMaster Go case study. Read from
the GreenMaster repos (read-only) on 2026-10-24: `gmg-backend` (Rails 8 API), `gmg-mobile`
(Expo), `greenmaster-web` (React admin). No database dumps were opened. All names, sites and
numbers in the drawings are invented sample data.

This repo is public. Leave out of anything public: hosting, storage vendor, SMS vendor, env
names, keys, URLs, real customer names. Table and column names are fine (simplified).

Pencil frames: `design/portfolio.pen`, band y 36000 to 38000, frames named
`Arch GreenMaster · <variant>` with a `· dark` copy below each.

## 1. The paper form, field by field

There is no scan of the old paper form in the repos. The closest thing is the report PDF the
web admin exports (`greenmaster-web/app/components/service-report-pdf.tsx`): sections
*Thông tin cơ bản* (visit type, date, time), *Khách hàng & Địa điểm*, *Nhân viên thực hiện*,
*Khu vực và dịch vụ*, *Công việc thực hiện* (task, category, chemical, quantity, note),
*Đại diện khách hàng*, *Ghi chú*. The phone form uses the same order
(`gmg-mobile/components/service-reports/ServiceReportFormFields.tsx`: site, service types, visit
type, control areas, work items, note). The drawn paper form follows that order.

| Paper field | Lands in | Notes | Evidence |
| --- | --- | --- | --- |
| Report No. | `service_reports.report_number` (serial, unique) | Set by the database, not written by hand | `db/schema.rb` |
| Site | `service_reports.location_id` → `locations.name, address` | Locations belong to an organization (customer) | `app/models/location.rb` |
| Date | `service_reports.service_date` | Required | `app/models/service_report.rb` |
| Time in · out | `started_at`, `finished_at` (time) | `started_at` is stamped by a `before_save` when status turns `ongoing`; `finished_at` on completion | `service_report.rb`, `app/services/service_completion_service.rb` |
| Visit type | `service_reports.visit_type` enum | initial, follow_up, routine, complaint, intensive | `service_report.rb` |
| Services (checkboxes) | `report_service_types` (join) → `service_types.name` | Many per report, unique per pair | `app/models/report_service_type.rb` |
| Areas treated (checkboxes) | `service_reports.control_areas` integer[] | 8 fixed areas, GIN index, no join table | `service_report.rb` `CONTROL_AREA_ENUM`, `db/schema.rb` |
| Work done table | `report_tasks` (one row per line): `service_task_id`, `chemical_id`, `quantity`, `notes` | Tasks sit in `task_categories`; tasks bill `by_quantity` or `by_chemical` | `app/models/report_task.rb`, `service_task.rb` |
| Chemical (per line) | `report_tasks.chemical_id` → `chemicals.name` | Catalog items are archived, not deleted, so old reports still render | `chemical.rb`, `service_task.rb` (`archived_at`) |
| Technician | `service_reports.staff_id` → `users` | Admins can create a report for another staff member | `app/api/v1/service_reports.rb` |
| Customer rep | `service_reports.contact_id` → `contacts.name, position, phone_number` | Required once complete; can be created during sign-off | `service_report.rb`, `service_completion_service.rb` |
| Rating | `service_reports.customer_rating` 1..5 | Required once complete | `service_report.rb` |
| Customer remarks | `service_reports.remarks` (internal `note` is separate) | | `service_completion_service.rb` |
| Signature | `service_reports.signature` (one attached file) | Base64 image from the phone, stored as a file | `service_completion_service.rb#attach_signature` |
| (or) one-time code | `otps`: `identifier`, `code` (bcrypt), `expires_at`, `used_at`, `locked_until` | Purpose `confirmation`; locks with growing back-off after repeated misses | `app/models/otp.rb` |
| Photos | `service_reports.images` (many files) | Not on the paper; left out of the figure | `service_report.rb` |
| (none) | `service_reports.status` draft → ongoing → complete | Server-owned, no paper equivalent | `service_report.rb` |

Tables in the figure (8 stories, some cards merged): `service_reports`, `report_tasks`,
`report_service_types`, `locations`, `users`, `contacts`, a "catalog" card for
`service_types` / `service_tasks` / `chemicals`, and a "sign-off" card for `otps` plus the
signature file. Left out: organizations, organization_types, roles, task_categories, active
storage tables, friendly_id.

Sign-off flow (`PUT /service_reports/:id/complete`, `app/api/v1/service_reports.rb` ~L650):
`verification_method` is `otp` or `signature`. For `otp`, the phone first calls
`request_completion_otp`; the code goes by Zalo when the contact is `zalo_matched`, by SMS
otherwise. Then one transaction writes status `complete`, rating, remarks, contact,
`finished_at`, and attaches the signature if that path was used.

## 2. What Hieu built (git log)

Authors counted as Hieu: "Hieu Le" (lthieu9601) and "Lê Trung Hiếu" (lthieu96).

- **Backend:** 88 of 145 commits. Created on 2025-06-21 by Hieu: `ServiceReport`, `ReportTask`,
  `ReportServiceType`, `ServiceType`, `ServiceTask`, `TaskCategory`, `Chemical` ("feat: add
  Service Reports and related models…"). Earlier (2025-05-24): `Location`, `Contact`,
  `Organization`. `app/api/v1/service_reports.rb`: 18 of 21 commits. `ServiceCompletionService`:
  created by Hieu, 9 of 12 commits (Zalo/SMS choice included). Catalog archiving: "feat: service
  catalog admin + report task fixes" (2026-06-13).
- **Team (anhvy):** `Otp` model and `OtpService` (2025-06-23), `User` model (created), signature
  sign-off ("feat: confirm service report with signature", 2026-06-10, plus the phone's
  `SignatureVerificationContent.tsx`), and the PDF component in the web admin (5 of 5 commits).
- **Phone app:** 55 of 66 commits Hieu (report form, task and chemical sheets, OTP entry, the
  completion flow).
- **Web admin:** 109 of 139 commits Hieu (report management, chemicals CRUD, work catalog admin).

In the figures: filled accent dot on service_reports, report_tasks, report_service_types,
locations, contacts, catalog, phone app, API, rows; hollow dot on users, sign-off/otps, PDF.

## 3. Interaction ideas

- **Field ↔ column linking, both ways.** Hover a paper field: accent wash on the field, a link
  draws to its column, and for foreign keys a second hop to the lookup table's column. Hover a
  column: the reverse. Columns with no paper field (status) say "set by the server".
- **One field traced through every layer** (B, D): the same item lit on paper, phone row and row
  value at once, so the reader sees the same fact three times in three shapes.
- **Scrub paper → phone → rows** (B): a thumb with three stops; the phone slides over the paper,
  values drop into rows, row counts roll with NumberFlow.
- **Normalisation as the payoff** (A, C): the paper writes "Fipronil gel"; the row keeps an id.
  Renaming or retiring a chemical never rewrites an old report.
- **Signature or code** (D): the API branches to `otps`, a code goes to the customer's phone, the
  loop closes through the technician's phone. A toggle swaps in the signature path (file instead
  of otps row). Both paths end in the same transaction.
- **Autoplay chapters** with play/pause under the figure, as in Sway and Cerebro; hover or focus
  pauses and pins.

## 4. Motion spec

| What | Duration | Easing |
| --- | --- | --- |
| Field / row highlight, card stroke to accent | 150 ms | ease-out |
| Link drawing (stroke-dashoffset) | 240 ms | ease-in-out (moves along a path) |
| Second hop to lookup | 240 ms, starts at +200 ms | ease-in-out |
| Detail panel text (`text-in`, 2 px blur rise) | 200 ms | ease-out |
| Packet along an edge (D) | 300 ms | ease-in-out |
| Clipping drop (C): 3 px, rotation 0 → ±2° | 220 ms, 60 ms stagger | ease-out |
| Phone over paper (B) | tied to scrub; 6 s when played | ease-in-out across the run |
| Counts (NumberFlow) | NumberFlow default | ease-out |
| Chapter length | 2.4 s | linear progress bar |

Rules: UI reactions 150 to 300 ms ease-out; anything that travels along a path ease-in-out;
nothing bounces. Pause autoplay off-screen (IntersectionObserver) and on hover/focus.

## 5. Reduced motion

`prefers-reduced-motion: reduce`: autoplay off, links appear at full length without drawing,
no blur on text (plain swap), no packets, clippings already placed without rotation change,
B's scrub becomes three tabs that cross-fade in 150 ms, NumberFlow shows final values. Hover and
keyboard linking still work. Every state reachable by keyboard: chapter labels are buttons,
arrow keys step chapters / fields.

## 6. Open questions

1. Handwriting: values on the paper use Caveat (a Google font, one extra font file). Keep it,
   or set values in Geist Mono to stay with the site's two fonts?
2. The case study copy says the web admin has "PDF export", but the PDF component is the
   teammate's. Keep the line, or credit it in the figure only (D shows it as team)?
3. Signature sign-off is the teammate's work, the code path (completion service, Zalo/SMS) is
   Hieu's. Show both in the figure as now, or only the code path?
4. Was there a real paper form the company used before? A photo or the field list would let A
   and C match it more closely; the current form is reconstructed from the PDF and phone form.
