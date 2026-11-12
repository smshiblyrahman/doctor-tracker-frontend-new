// End-to-end smoke test + README screenshots. Requires the backend (npm run dev in
// /backend, seeded) and the client (npm run dev) to be running.
//   node scripts/e2e-smoke.mjs
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve(process.cwd(), "..", "docs", "screenshots");
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const consoleErrors = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch();

async function newPage(viewport, colorScheme = "light") {
  const context = await browser.newContext({ viewport, colorScheme, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(`${page.url()} :: ${msg.text().slice(0, 700)}`));
  page.on("pageerror", (err) => consoleErrors.push(`${page.url()} :: ${err.message}`));
  return { context, page };
}

async function login(page) {
  await page.goto(`${BASE}/doctors`);
  check("unauthenticated visit redirects to /login with next", /\/login\?next=%2Fdoctors/.test(page.url()), page.url());
  await page.getByLabel("Email").fill("admin@doctortracker.dev");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  const loginError = page.locator("form [role=alert]");
  await loginError.waitFor();
  check("wrong password shows an error", (await loginError.textContent()).includes("Invalid email or password"));
  await page.getByLabel("Password").fill("Admin@12345");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(`${BASE}/doctors`);
  check("login returns to the requested page", page.url() === `${BASE}/doctors`);
}

// ---------------- Desktop flow ----------------
const { context: desktop, page } = await newPage({ width: 1440, height: 900 });
{
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(OUT, "login-desktop.png") });
  await login(page);

  // Doctors list
  await page.getByRole("table").waitFor();
  await page.waitForSelector("tbody tr a[href^='/doctors/']");
  const rows = await page.locator("tbody tr").count();
  check("doctors table shows 10 rows", rows === 10, `${rows} rows`);
  check("pagination summary shown", await page.getByText(/Showing 1–10 of 40/).isVisible());
  await page.screenshot({ path: path.join(OUT, "doctors-desktop.png") });

  // Prefix search (debounced, URL-synced)
  await page.getByRole("searchbox", { name: "Search doctors" }).fill("card");
  await page.waitForURL(/search=card/);
  await page.waitForFunction(() => document.querySelectorAll("tbody tr").length < 10);
  const specs = await page.locator("tbody tr td:nth-child(2)").allTextContents();
  check("prefix search 'card' only returns Cardiology", specs.length > 0 && specs.every((s) => s.includes("Cardiology")), specs.join(","));
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.waitForURL((u) => !u.search.includes("search="));

  // Specialization filter
  await page.getByLabel("Filter by specialization").click();
  await page.getByRole("option", { name: "Neurology" }).click();
  await page.waitForURL(/specialization=Neurology/);
  await page.waitForFunction(() => [...document.querySelectorAll("tbody tr td:nth-child(2)")].every((td) => td.textContent.includes("Neurology")));
  check("specialization filter applied", true);
  await page.getByRole("button", { name: "Clear", exact: true }).click();

  // Sort by name
  await page.getByRole("button", { name: /^Sort by Doctor/ }).click();
  await page.waitForURL(/sort=name/);
  check("sorting is written to the URL", page.url().includes("sort=name"));

  // Pagination
  await page.goto(`${BASE}/doctors`);
  await page.getByRole("button", { name: "Next page" }).click();
  await page.waitForURL(/page=2/);
  await page.getByText(/Showing 11–20 of 40/).waitFor();
  check("next page loads page 2", true);

  // Create doctor (with validation)
  await page.getByRole("button", { name: "Add doctor" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Add doctor" }).click();
  check("empty form shows inline validation", await page.getByText("Name must be at least 2 characters").isVisible());
  const email = `e2e.${Date.now()}@example.org`;
  await page.getByRole("dialog").getByLabel("Full name", { exact: true }).fill("Dr. Playwright Tester");
  await page.getByRole("dialog").getByLabel("Specialization", { exact: true }).fill("Cardiology");
  await page.getByRole("dialog").getByLabel("Hospital", { exact: true }).fill("Automation General");
  await page.getByRole("dialog").getByLabel("Phone", { exact: true }).fill("+1 555 777 8888");
  await page.getByRole("dialog").getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("dialog").getByRole("button", { name: "Add doctor" }).click();
  await page.waitForURL(/\/doctors\/[a-f0-9]{24}$/);
  await page.getByRole("heading", { name: "Dr. Playwright Tester" }).waitFor();
  check("created doctor opens its detail page", true);

  // Duplicate email maps to the field
  const doctorUrl = page.url();
  await page.goto(`${BASE}/doctors`);
  await page.getByRole("button", { name: "Add doctor" }).first().click();
  await page.getByRole("dialog").getByLabel("Full name", { exact: true }).fill("Dr. Duplicate");
  await page.getByRole("dialog").getByLabel("Specialization", { exact: true }).fill("Cardiology");
  await page.getByRole("dialog").getByLabel("Hospital", { exact: true }).fill("Automation General");
  await page.getByRole("dialog").getByLabel("Phone", { exact: true }).fill("+1 555 777 8888");
  await page.getByRole("dialog").getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("dialog").getByRole("button", { name: "Add doctor" }).click();
  await page.getByText("This email is already used by another doctor").waitFor();
  check("duplicate email error shown on the email field", true);
  await page.keyboard.press("Escape");

  // Add patient under doctor
  await page.goto(doctorUrl);
  await page.getByText("No patients yet").waitFor();
  await page.getByRole("button", { name: "Add patient" }).first().click();
  await page.getByRole("dialog").getByLabel("Full name", { exact: true }).fill("Paula Pipeline");
  await page.getByRole("dialog").getByLabel("Age", { exact: true }).fill("47");
  await page.getByRole("dialog").getByLabel("Gender", { exact: true }).click();
  await page.getByRole("option", { name: "Female" }).click();
  await page.getByRole("dialog").getByLabel("Condition", { exact: true }).fill("Arrhythmia");
  await page.getByRole("dialog").getByLabel("Phone", { exact: true }).fill("+1 555 321 0000");
  await page.getByRole("dialog").getByRole("button", { name: "Add patient" }).click();
  await page.locator("tbody").getByText("Paula Pipeline").waitFor();
  check("patient added under the doctor appears in their list", true);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "doctor-detail-desktop.png") });

  // Edit patient via row action
  await page.getByRole("button", { name: "Actions for Paula Pipeline" }).click();
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.getByRole("dialog").getByLabel("Age", { exact: true }).fill("48");
  await page.getByRole("dialog").getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.locator("tbody tr", { hasText: "Paula Pipeline" }).getByText("48", { exact: true }).waitFor();
  check("patient edited from the doctor page", true);

  // Remove patient from doctor
  await page.getByRole("button", { name: "Actions for Paula Pipeline" }).click();
  await page.getByRole("menuitem", { name: "Remove from list" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Remove" }).click();
  await page.getByText("No patients yet").waitFor();
  check("patient removed from the doctor's list", true);

  // Delete the test doctor
  await page.getByRole("button", { name: "Delete", exact: true }).first().click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await page.waitForURL(`${BASE}/doctors`);
  check("doctor deleted and redirected to the list", true);

  // Patients page: filters
  await page.goto(`${BASE}/patients?condition=Hypertension&gender=female&age=65-130`);
  await page.waitForSelector("tbody tr a[href^='/patients/']");
  const conds = await page.locator("tbody tr td:nth-child(4)").allTextContents();
  check("patients filtered by condition/gender/age from URL", conds.length > 0 && conds.every((c) => c === "Hypertension"), `${conds.length} rows`);
  await page.goto(`${BASE}/patients`);
  await page.waitForSelector("tbody tr a[href^='/patients/']");
  await page.screenshot({ path: path.join(OUT, "patients-desktop.png") });

  // Patient detail edit
  const firstPatient = page.locator("tbody tr a[href^='/patients/']").first();
  await firstPatient.click();
  await page.getByText("Patient information").waitFor();
  const conditionField = page.getByLabel("Condition", { exact: true });
  const newCondition = (await conditionField.inputValue()) === "Annual Checkup" ? "Hypertension" : "Annual Checkup";
  await conditionField.fill(newCondition);
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByText(/updated$/).first().waitFor();
  check("patient edited on the detail page", true);
  await page.screenshot({ path: path.join(OUT, "patient-detail-desktop.png") });

  // Command palette
  await page.keyboard.press("Control+k");
  await page.getByPlaceholder("Search doctors, patients…").fill("neur");
  await page.getByRole("option").first().waitFor();
  check("command palette searches", (await page.getByRole("option").count()) > 0);
  await page.keyboard.press("Escape");

  // Dashboard
  await page.goto(`${BASE}/dashboard`);
  await page.getByText("Registrations").waitFor();
  await page.waitForSelector(".recharts-area");
  await page.waitForSelector(".recharts-bar-rectangle");
  await page.waitForSelector(".recharts-pie");
  await page.waitForTimeout(800);
  const totalDoctors = await page.locator("[data-slot=card]", { hasText: "Total doctors" }).textContent();
  check("dashboard shows total doctors", /40/.test(totalDoctors ?? ""), totalDoctors?.slice(0, 60));
  await page.screenshot({ path: path.join(OUT, "dashboard-desktop.png"), fullPage: true });

  // Dark mode
  await page.getByRole("button", { name: "Toggle dark mode" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, "dashboard-dark-desktop.png"), fullPage: true });
  await page.getByRole("button", { name: "Toggle dark mode" }).click();
}

// ---------------- Mobile ----------------
const { context: mobile, page: m } = await newPage({ width: 390, height: 844 });
{
  await m.goto(`${BASE}/login`);
  await m.waitForLoadState("networkidle");
  await m.screenshot({ path: path.join(OUT, "login-mobile.png") });
  await m.getByLabel("Email").fill("admin@doctortracker.dev");
  await m.getByLabel("Password").fill("Admin@12345");
  await m.getByRole("button", { name: "Sign in" }).click();
  await m.waitForURL(`${BASE}/dashboard`);
  await m.waitForSelector(".recharts-area");
  await m.waitForSelector(".recharts-pie");
  await m.waitForTimeout(800);
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check("mobile dashboard has no horizontal scroll", overflow <= 0, `overflow ${overflow}px`);
  await m.screenshot({ path: path.join(OUT, "dashboard-mobile.png"), fullPage: true });

  await m.getByRole("button", { name: "Toggle sidebar" }).click();
  await m.getByRole("link", { name: "Doctors" }).waitFor();
  await m.screenshot({ path: path.join(OUT, "nav-mobile.png") });
  await m.getByRole("link", { name: "Doctors" }).click();
  await m.waitForURL(`${BASE}/doctors`);
  await m.waitForSelector("tbody tr a[href^='/doctors/']");
  const overflowDoctors = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check("mobile doctors page has no horizontal scroll", overflowDoctors <= 0, `overflow ${overflowDoctors}px`);
  await m.screenshot({ path: path.join(OUT, "doctors-mobile.png"), fullPage: true });

  await m.goto(`${BASE}/patients`);
  await m.waitForSelector("tbody tr a[href^='/patients/']");
  await m.screenshot({ path: path.join(OUT, "patients-mobile.png"), fullPage: true });

  // Logout
  await m.goto(`${BASE}/dashboard`);
  await m.getByRole("button", { name: "Toggle sidebar" }).click();
  await m.getByRole("button", { name: "Account menu" }).click();
  await m.getByRole("menuitem", { name: "Sign out" }).click();
  await m.waitForURL(`${BASE}/login`);
  await m.goto(`${BASE}/dashboard`);
  check("after sign-out the app redirects to login", m.url().startsWith(`${BASE}/login`));
}

await desktop.close();
await mobile.close();
await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
const relevantErrors = consoleErrors.filter((e) => !/Failed to load resource: the server responded with a status of (401|409)/.test(e));
console.log(`Console errors: ${relevantErrors.length}`);
relevantErrors.slice(0, 15).forEach((e) => console.log("  " + e));
process.exit(failed.length || relevantErrors.length ? 1 : 0);
