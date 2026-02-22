# Changelog

## [0.2.0](https://github.com/iampraiez/Persona/compare/persona-server-v0.1.0...persona-server-v0.2.0) (2026-02-22)

### Features

- add BuyCredits page and integrate payment processing; update user credits handling ([9654c45](https://github.com/iampraiez/Persona/commit/9654c45d7567c1dce06b8f2d76528fcb7f9e9c50))
- add controllers and services for feedback, goals, notifications, payments, and user management ([9871c18](https://github.com/iampraiez/Persona/commit/9871c1841b1edec3d4fd5994f5a3f2c6c982a8b0))
- Add event skipping functionality with API integration. ([abdc84d](https://github.com/iampraiez/Persona/commit/abdc84d8e132addf447141b0361a7ccd49970af0))
- add FocusSession page and integrate with Dashboard and Timetable; include focus duration tracking in events ([c7158a4](https://github.com/iampraiez/Persona/commit/c7158a465738261e3302252d934e9ea9561f927b))
- **ai:** implement timetable generation logic in AI service ([ecf7536](https://github.com/iampraiez/Persona/commit/ecf75363d46ce3bd28cf7fb8c5c3686c68729308))
- **api:** implement event copying and range deletion endpoints ([ecf7536](https://github.com/iampraiez/Persona/commit/ecf75363d46ce3bd28cf7fb8c5c3686c68729308))
- **api:** increase request timeout to 30 seconds and add new timetable generation endpoint ([ecf7536](https://github.com/iampraiez/Persona/commit/ecf75363d46ce3bd28cf7fb8c5c3686c68729308))
- Display total event and goal counts in settings and refactor event status UI in timetable. ([d03cdc5](https://github.com/iampraiez/Persona/commit/d03cdc581661769ff7016c1b155ecf25ed4b9e58))
- Enhance BuyCredits and Timetable functionality with demo mode support ([5da12fd](https://github.com/iampraiez/Persona/commit/5da12fd85a7b2b84a0dc1db4ffb2bf58d7401f34))
- enhance Google login flow with returnTo parameter for better redirection handling ([877dca2](https://github.com/iampraiez/Persona/commit/877dca20f898332b6011f03b00a713eb1fd82b1f))
- Enhance payment verification to return detailed statuses and update client to process them, alongside a minor UI height adjustment. ([862c48b](https://github.com/iampraiez/Persona/commit/862c48b0e0ef92353e1fcde6c1bcfd587f92dad9))
- enhance production environment detection and enable React Router v7 future flags. ([17d298c](https://github.com/iampraiez/Persona/commit/17d298c52b6c5fb43b2dcf257f2e8924103f9fc6))
- Enhance Timetable UI, update dependencies, and establish comprehensive CI/CD and security workflows. ([9064be0](https://github.com/iampraiez/Persona/commit/9064be01b92dc945849bf392da6832d0683f126b))
- enhance User model; add purchasedAiCredits and pushSubscriptions fields, and update Event model with focusDuration ([5291548](https://github.com/iampraiez/Persona/commit/529154899907333cdda216c61e85d0f7ad235ad6))
- **events:** add bulk event deletion and copying functionality ([ecf7536](https://github.com/iampraiez/Persona/commit/ecf75363d46ce3bd28cf7fb8c5c3686c68729308))
- Implement a user feedback widget, enhance the 404 page, and bolster server security and performance. ([963a4ca](https://github.com/iampraiez/Persona/commit/963a4cada0c3eac6b102f081b65c4975f7e70392))
- Implement detailed goal analysis in analytics, add logout loading state, optimize timetable data refresh with query invalidation, and enhance notification subscription handling. ([759ebb5](https://github.com/iampraiez/Persona/commit/759ebb5648e38c609a4018ab543930624f2248be))
- Implement mark all notifications as read functionality with an unread count badge. ([ddf4f3c](https://github.com/iampraiez/Persona/commit/ddf4f3c76d05260cc39900afdb9c689397a6cc70))
- Implement user feedback submission system with client-side widget, dedicated API endpoint, and email notification. ([99ecfd8](https://github.com/iampraiez/Persona/commit/99ecfd8d902aaadb52dacbb0561f15618281846e))
- **notification:** add utility function for URL base64 to Uint8Array conversion ([ecf7536](https://github.com/iampraiez/Persona/commit/ecf75363d46ce3bd28cf7fb8c5c3686c68729308))
- **push:** integrate VAPID key for push notifications ([ecf7536](https://github.com/iampraiez/Persona/commit/ecf75363d46ce3bd28cf7fb8c5c3686c68729308))
- **rate-limiter:** add rate limiting middleware for AI and event operations ([ecf7536](https://github.com/iampraiez/Persona/commit/ecf75363d46ce3bd28cf7fb8c5c3686c68729308))
- update build script in package.json and add foreign key constraint to PushSubscription table ([e397a92](https://github.com/iampraiez/Persona/commit/e397a92acb56d4979d8c72150251a9604e757dda))
- update push notification handling; improve subscription management and error logging ([922bf20](https://github.com/iampraiez/Persona/commit/922bf20dcb9b26540f7724f9c2ffc80eadfc94b2))
- update README with enhanced feature descriptions, remove NotificationManager component, and improve notification handling in Header; refactor push utility for better key management ([8220bd3](https://github.com/iampraiez/Persona/commit/8220bd33fa44bdcaea3f5d4c5e37d2a79dc33f48))
- update User model formatting and change default focusDuration in Event model to 25 ([9dc8d54](https://github.com/iampraiez/Persona/commit/9dc8d54bd18d750b477075392a70556a8c869a77))

### Bug Fixes

- **auth:** improve cookie options for production environment ([ecf7536](https://github.com/iampraiez/Persona/commit/ecf75363d46ce3bd28cf7fb8c5c3686c68729308))
- correct order of commands in build, start, and postinstall scripts in package.json ([6553658](https://github.com/iampraiez/Persona/commit/65536583c7d4137b8e850657c6d0edcc3ac2f8b2))
- correct type assertion for sameSite cookie option ([634179b](https://github.com/iampraiez/Persona/commit/634179baa5eb265151670b1f07c4bc72f8410826))
- improve CORS handling by using startsWith for allowed origins ([2c62733](https://github.com/iampraiez/Persona/commit/2c62733c224843313fb3fbd59172bc6eb776b377))
- update package name to persona-server and enhance start script with prisma generate ([5af0cd2](https://github.com/iampraiez/Persona/commit/5af0cd24a6d214c0225e9304b2f6a0aa77766300))
- update sameSite cookie option based on production environment ([f69a494](https://github.com/iampraiez/Persona/commit/f69a494eef5181e880cace4fc7b482d8872310df))
