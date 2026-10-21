# Resource sharing and saved reading

`ResourceActions` is used by the article/blog template and video template. Its sticky desktop bar becomes a bottom dock on mobile. `SavedResources` displays only current published content at `/resources/saved`.

## Measurement contract

Shared links use the canonical resource URL with `utm_source` set to the selected channel, `utm_medium=social` (or `email`), `utm_campaign=resource_share` and `utm_content=<type>_<slug>`. Existing visitor queries and anchors are never forwarded. No visitor identifier is added.

The existing consent-aware `track()` function emits the following dataLayer events only when `measurementConfig.enabled` and the visitor's current analytics consent are both true:

| Event | Additional fields |
|---|---|
| `ifranchise_resource_share_open` | None |
| `ifranchise_resource_share_intent` | `channel`, `action=open` |
| `ifranchise_resource_share` | `channel`, `action=copy` or `handoff` |
| `ifranchise_resource_save` | `action=save` or `remove` |
| `ifranchise_resource_resume` | `progress_percent` |
| `ifranchise_resource_read_progress` | `progress_percent` at 25/50/75/100 per page mount |

All events include `content_id`, `content_type` (article/blog/video), and `content_path`. These fields are allowlisted; arbitrary text, names, emails and query strings are excluded. Opening a social composer is an intent, not proof of a published post. Native sharing completion is a platform handoff. Instagram copies the link for the visitor to paste; it does not publish through an API.

Analytics remains disabled and no provider ID was added in this change. When integrating analytics later, configure `lib/measurement.mjs`, map these custom events in the configured provider, update the privacy notice and consent version for the actual integration, and validate consent before activation. Sharing and saving work independently of optional analytics consent.

## Browser-local storage

Only explicitly saved resources are stored in `ifranchise_saved_resources_v1`, capped at 100. Data comprises canonical path, bounded reading progress, section anchor/offset, savedAt and updatedAt. No account, server library, automatic browsing history, or cross-device sync is created. Failed storage writes are surfaced to the visitor. Removed/unpublished content is not rendered in the saved library.

Saved reading positions update during reading and flush on page hide/visibility change. A direct return offers Continue/Start again; a library link resumes automatically. Section anchors retain context across viewport widths. Video pages save transcript reading position, not playback position on YouTube. The share dialog freezes progress writes while open and preserves the scroll position.
