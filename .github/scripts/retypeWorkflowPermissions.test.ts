// node --test .github/scripts/retypeWorkflowPermissions.test.ts
import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { parse } from "yaml";

interface Step {
    uses?: string;
    with?: Record<string, unknown>;
}

interface Job {
    permissions?: Record<string, string>;
    steps: Step[];
}

interface Workflow {
    permissions?: Record<string, string>;
    jobs: Record<string, Job>;
}

const workflow = parse(readFileSync(new URL("../workflows/retype-action.yml", import.meta.url), "utf8")) as Workflow;
const jobs = Object.entries(workflow.jobs);

function usesAction(step: Step, action: string) {
    return step.uses?.startsWith(`${action}@`) === true;
}

void describe("retype-action.yml", () => {
    void it("grants no permission at the workflow level, so a job only has the ones it declares", () => {
        deepStrictEqual(workflow.permissions, {});
    });

    void it("builds the website in a job that can only read the repository", () => {
        const buildJobs = jobs.filter(([, job]) => job.steps.some(step => usesAction(step, "retypeapp/action-build")));

        strictEqual(buildJobs.length, 1);
        deepStrictEqual(buildJobs[0][1].permissions, { contents: "read" });
    });

    void it("never leaves the checkout token in the git configuration", () => {
        const checkouts = jobs.flatMap(([, job]) => job.steps.filter(step => usesAction(step, "actions/checkout")));

        ok(checkouts.length > 0);

        for (const checkout of checkouts) {
            strictEqual(checkout.with?.["persist-credentials"], false);
        }
    });

    void it("only runs the GitHub Pages deployment in a job that holds a write permission", () => {
        const writeJobs = jobs.filter(([, job]) => Object.values(job.permissions ?? {}).includes("write"));

        for (const [name, job] of writeJobs) {
            deepStrictEqual(job.permissions, { pages: "write", "id-token": "write" }, name);
            ok(
                job.steps.every(step => usesAction(step, "actions/deploy-pages")),
                `${name} runs a step that is not actions/deploy-pages`
            );
        }
    });
});
