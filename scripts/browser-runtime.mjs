import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const localRuntime=resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
let chromium;
try{({chromium}=require(process.env.YARDU_PLAYWRIGHT_MODULE||(existsSync(localRuntime)?localRuntime:'playwright')));}catch{}
export {chromium};
const installedShell=resolve(homedir(),'Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell');
export const browserPath=process.env.YARDU_CHROMIUM_PATH||(existsSync(installedShell)?installedShell:chromium?.executablePath());
export function requireBrowserQA(){if(!chromium)throw new Error('Browser QA requires Playwright. Point YARDU_PLAYWRIGHT_MODULE at an existing installation and YARDU_CHROMIUM_PATH at its browser. No browser is downloaded by this project.');}
