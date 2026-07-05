#!/bin/sh
set -eu

echo "Applying database migrations..."
set +e
migration_output="$(npm run prisma:deploy 2>&1)"
migration_status=$?
set -e
printf '%s\n' "$migration_output"

if [ "$migration_status" -ne 0 ]; then
  case "$migration_output" in
    *P3005*)
      echo "Existing untracked schema detected; synchronizing and recording the baseline once..."
      npm run prisma:sync -- --skip-generate
      npx prisma migrate resolve --applied 20260702170000_add_contact_messages
      npx prisma migrate resolve --applied 20260702200000_add_saved_jobs_cv_drafts
      npx prisma migrate resolve --applied 20260705130000_add_notification_preferences
      echo "Baseline recorded. Verifying migration state..."
      npm run prisma:deploy
      ;;
    *)
      echo "Migration failed for a reason other than an untracked existing schema. Aborting startup."
      exit "$migration_status"
      ;;
  esac
fi

echo "Database is ready. Starting Beleqet API..."
exec npm run start:prod
