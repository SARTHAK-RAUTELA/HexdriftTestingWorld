# QA Launcher

Local web form that starts a headless Claude Code QA run (`claude -p`) in this repo.

```
node qa-launcher/server.js
```

Then open http://localhost:4000.

- Fill in the ticket, URLs, Figma link, test details and browsers, then click **Start QA**.
- The right-hand panel streams Claude's progress live. Jobs run one at a time and the rest wait in a queue.
- **Preview prompt** shows exactly what Claude will receive. The template is in `prompt.js`.
- **Follow-up** continues the same Claude session (`--resume`), e.g. "also check 1001px".
- When a run finishes, the report link appears if Claude printed the report path.
- Job history lives in `qa-launcher/jobs/<id>/` (`job.json`, `prompt.md`, `events.ndjson`), which git ignores.

The server listens on 127.0.0.1 only and rejects cross-origin requests, because it can run Claude with tool permissions.
Set `QA_LAUNCHER_PORT` to change the port.
