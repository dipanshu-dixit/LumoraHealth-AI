import { expect, test, describe, mock, beforeEach, afterEach, spyOn } from "bun:test";

// Use a more aggressive mocking approach for the entire module path
mock.module("helmet", () => ({
  default: () => (req, res, next) => next(),
}));

mock.module("express-rate-limit", () => ({
  default: () => (req, res, next) => next(),
}));

mock.module("xss", () => ({
  default: (val) => val,
}));

// Use dynamic import to ensure mocks are applied
const { hipaaComplianceMiddleware } = await import("../middleware/security.js");

describe("hipaaComplianceMiddleware", () => {
  let req;
  let res;
  let next;
  let consoleLogSpy;

  beforeEach(() => {
    req = {
      method: "GET",
      path: "/api/test",
      ip: "127.0.0.1",
      user: null,
    };
    res = {
      setHeader: mock(() => {}),
    };
    next = mock(() => {});
    consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test("should set HIPAA compliance headers", () => {
    hipaaComplianceMiddleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith("X-HIPAA-Compliant", "true");
    expect(res.setHeader).toHaveBeenCalledWith("X-Data-Retention", "30 days");
    expect(res.setHeader).toHaveBeenCalledWith("X-Encryption-Status", "enabled");
  });

  test("should log audit information for anonymous user", () => {
    hipaaComplianceMiddleware(req, res, next);

    expect(consoleLogSpy).toHaveBeenCalled();

    // Find the call that contains HIPAA_AUDIT:
    const auditCall = consoleLogSpy.mock.calls.find(call =>
      call.some(arg => typeof arg === 'string' && arg.includes('HIPAA_AUDIT:'))
    );

    expect(auditCall).toBeDefined();
    const hipaaArg = auditCall.find(arg => typeof arg === 'string' && arg.includes('HIPAA_AUDIT:'));
    const dataArg = auditCall.find(arg => typeof arg === 'string' && arg.startsWith('{') && arg.endsWith('}'));

    let logData;
    if (dataArg) {
        logData = JSON.parse(dataArg);
    } else {
        // Handle case where it might be "HIPAA_AUDIT: {...}"
        const parts = hipaaArg.split('HIPAA_AUDIT:');
        logData = JSON.parse(parts[1].trim());
    }

    expect(logData.method).toBe("GET");
    expect(logData.path).toBe("/api/test");
    expect(logData.ip).toBe("127.0.0.1");
    expect(logData.userId).toBe("anonymous");
    expect(logData.compliance).toBe("HIPAA");
    expect(logData.timestamp).toBeDefined();
  });

  test("should log audit information for authenticated user", () => {
    req.user = { anonymousId: "user-123" };
    hipaaComplianceMiddleware(req, res, next);

    expect(consoleLogSpy).toHaveBeenCalled();
    const auditCall = consoleLogSpy.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('HIPAA_AUDIT:'))
    );

    expect(auditCall).toBeDefined();
    const hipaaArg = auditCall.find(arg => typeof arg === 'string' && arg.includes('HIPAA_AUDIT:'));
    const dataArg = auditCall.find(arg => typeof arg === 'string' && arg.startsWith('{') && arg.endsWith('}'));

    let logData;
    if (dataArg) {
        logData = JSON.parse(dataArg);
    } else {
        const parts = hipaaArg.split('HIPAA_AUDIT:');
        logData = JSON.parse(parts[1].trim());
    }
    expect(logData.userId).toBe("user-123");
  });

  test("should call next()", () => {
    hipaaComplianceMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
