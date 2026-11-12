import { sortingFromParam, sortingToParam } from "@/components/data-table/DataTable";
import { ageBandToQuery } from "@/components/patients/PatientFilters";
import { ApiError } from "@/lib/api";
import { safeNextPath } from "@/lib/auth";
import { applyServerErrors } from "@/lib/form-errors";
import { initials } from "@/lib/format";
import { doctorSchema } from "@/lib/validators/doctor";
import { patientSchema } from "@/lib/validators/patient";

describe("URL ⇄ table sorting", () => {
  it("round-trips sort params", () => {
    expect(sortingFromParam("name:asc", "createdAt:desc")).toEqual([{ id: "name", desc: false }]);
    expect(sortingFromParam(undefined, "createdAt:desc")).toEqual([{ id: "createdAt", desc: true }]);
    expect(sortingToParam([{ id: "age", desc: true }])).toBe("age:desc");
  });
});

describe("safeNextPath", () => {
  it("only allows same-site relative paths after login", () => {
    expect(safeNextPath("/patients?page=2")).toBe("/patients?page=2");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath(null)).toBe("/dashboard");
  });
});

describe("ageBandToQuery", () => {
  it("maps URL age bands to API params", () => {
    expect(ageBandToQuery("40-64")).toEqual({ minAge: 40, maxAge: 64 });
    expect(ageBandToQuery(undefined)).toEqual({});
  });
});

describe("validators", () => {
  it("mirror the API rules for doctors", () => {
    const result = doctorSchema.safeParse({ name: "D", specialization: "", hospital: "X", phone: "abc", email: "nope" });
    expect(result.success).toBe(false);
    const fields = result.success ? [] : result.error.issues.map((i) => i.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["name", "specialization", "hospital", "phone", "email"]));
  });

  it("rejects impossible patient ages", () => {
    const base = { name: "Pat", gender: "female", condition: "Asthma", phone: "+1 555 000 1111" };
    expect(patientSchema.safeParse({ ...base, age: 131 }).success).toBe(false);
    expect(patientSchema.safeParse({ ...base, age: 40 }).success).toBe(true);
  });
});

describe("applyServerErrors", () => {
  it("maps API validation details and email conflicts onto form fields", () => {
    const setError = jest.fn();
    const validation = new ApiError(400, "VALIDATION_ERROR", "Validation failed", [{ path: "body.phone", message: "Bad phone" }]);
    expect(applyServerErrors(validation, setError, ["phone"])).toBe(true);
    expect(setError).toHaveBeenCalledWith("phone", { type: "server", message: "Bad phone" });

    const conflict = new ApiError(409, "CONFLICT", "A record with this email already exists");
    expect(applyServerErrors(conflict, setError, ["email"])).toBe(true);
    expect(applyServerErrors(new Error("boom"), setError, ["email"])).toBe(false);
  });
});

describe("initials", () => {
  it("drops the Dr. prefix", () => {
    expect(initials("Dr. Sarah Chen")).toBe("SC");
    expect(initials("Mei")).toBe("M");
  });
});
