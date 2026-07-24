# Blankless Guild agent

This directory is a self-contained, deterministic Guild auto-managed state agent. It accepts a cancellation payload and produces the recovery decision log and ranked candidates. Guild executes it on Guild's runtime, and each webhook-triggered run becomes a Guild session audit log.

The root Next.js `tsconfig.json` excludes this directory because Guild supplies `@guildai/agents-sdk` and `zod` inside its own runtime.

## Initialize and publish

Run these commands manually from the repository root:

```bash
npm install -g @guildai/cli
guild auth login
guild auth status
cd guild-agent
guild agent init --name blankless-recovery
# Keep the agent.ts, scoring.ts, and data.ts in this directory if init asks before overwriting.
guild agent test
guild agent save --message "v1" --wait --publish
```

After publishing:

1. Open the Guild workspace and install the published `blankless-recovery` agent.
2. Create a webhook Trigger for that agent.
3. Copy the generated webhook URL into the web app as `GUILD_TRIGGER_WEBHOOK_URL`.
4. Trigger Scenario 1 and show the resulting Guild session as the external audit trail.

> TODO: Guild's public triggers documentation did not expose the direct webhook request envelope or signature requirements during implementation. Confirm the generated Trigger's expected body in the Guild UI before the live demo. The web adapter currently sends the cancellation payload directly as JSON.
