// Builds the Claude prompt for one QA job from the launcher form.

const RUN_TYPES = {
  new: 'New A/B test QA (first full pass)',
  retest: 'Re-test after developer fixes',
  prelaunch: 'Pre-launch re-check',
};

function section(title, body) {
  return body ? `## ${title}\n${body}\n\n` : '';
}

function buildPrompt(form, repoRoot) {
  const urls = [
    form.controlUrl && `- Control: ${form.controlUrl}`,
    ...form.variations.map((v, i) => `- ${v.label || `Variation ${i + 1}`}: ${v.url}`),
  ].filter(Boolean).join('\n');

  const outputs = [
    'Build the HTML QA report with screenshots, in the same style and location pattern as previous reports for this client.',
    form.publishArtifact && 'Publish the finished report as a private Artifact and include its link in your final message.',
    form.updateKb && 'Update the QA knowledge base: the client folder entry, `_client-notes.md` if you learned a quirk, and the `README.md` index.',
    form.commit
      ? 'When everything is done, commit only the files for this ticket (spec, recon scripts, report, results, screenshots, KB updates). Do not push.'
      : 'Do NOT commit or push anything.',
  ].filter(Boolean).map(s => `- ${s}`).join('\n');

  const codeNote = form.codePaths
    ? `${form.codePaths}\nLocal variation files are often stale or shared scratch files reused across tickets. Grep them and confirm they belong to this ticket before trusting them. The deployed preview URL is the source of truth.`
    : '';

  return `You are running UNATTENDED from the QA Launcher web form. Nobody can answer questions during this run.
When something is ambiguous, make the most reasonable assumption, keep going, and list every assumption in the report and in your final message.

# QA job: ${form.ticket}${form.testName ? ` — ${form.testName}` : ''}

- Client: ${form.client || '(not given; match the client by URL)'}
- Run type: ${RUN_TYPES[form.runType]}
- Testing platform: ${form.platform || '(not given)'}${form.experimentId ? `\n- Experiment / variation IDs: ${form.experimentId}` : ''}
- Repo root: ${repoRoot}

## URLs
${urls}

${section('Figma / design reference', form.figma)}${section('Variation code (local paths)', codeNote)}## Test details (pasted from the ticket)
${form.details}

${section('Goals / tracking to verify', form.goals)}${section('Previous bugs to re-check', form.previousBugs)}## Browsers / devices
${form.browsers.map(b => `- ${b}`).join('\n')}${form.viewports ? `\nExtra viewports: ${form.viewports}` : ''}
Run Playwright ONE browser project at a time (full parallel runs have been killed for memory on this machine).

## How to work
1. Read \`my-playwright-project/qa-knowledge-base/README.md\`, then this client's folder and \`_client-notes.md\`, and \`_shared/qa-workflow.md\` + \`_shared/test-type-checklists.md\`.
2. Follow the workflow order with no exceptions: Figma first → variation code → live/preview URL → write tests → run on each browser → HTML report with screenshots.
3. Write assertions from the design/ticket spec, not from what the code currently does.
4. Put the spec in \`my-playwright-project/testing/\` and helper scripts in a \`<ticket>-recon/\` folder, matching existing naming.
5. Check the console for errors and watch for other live experiments on the page interfering.

## Outputs
${outputs}

## Final message format
End with a short summary: pass/fail counts per browser, each bug (ID, severity, one line), assumptions made, and the absolute path of the HTML report.
`;
}

module.exports = { buildPrompt };
