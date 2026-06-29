import { ValidationError, RepairLog } from "@/validation/schemas";

/**
 * Repair Engine Framework
 * Handles validation errors with three strategies:
 * 1. Structural: Fix missing fields, arrays, objects
 * 2. Field: Fix type mismatches, invalid values
 * 3. Consistency: Fix cross-field relationships and dependencies
 */

export type RepairStrategy = "structural" | "field" | "consistency";

export interface RepairOperation {
  strategy: RepairStrategy;
  field?: string;
  original?: unknown;
  repaired?: unknown;
  success: boolean;
  message: string;
}

// ============= STRUCTURAL REPAIRS =============

export function repairStructuralError(
  data: unknown,
  error: ValidationError,
  errorPath?: string
): RepairOperation {
  const field = error.field || errorPath;

  if (!field) {
    return {
      strategy: "structural",
      success: false,
      message: "No field path available for structural repair",
    };
  }

  // Handle missing required fields
  if (error.message.includes("required") || error.message.includes("required field")) {
    const repaired = repairMissingField(data, field);

    return {
      strategy: "structural",
      field,
      original: undefined,
      repaired,
      success: !!repaired,
      message: repaired ? `Added missing field: ${field}` : `Failed to repair missing field: ${field}`,
    };
  }

  // Handle array/object structure issues
  if (error.message.includes("array") || error.message.includes("object")) {
    const repaired = ensureStructure(data, field, error.message);

    return {
      strategy: "structural",
      field,
      repaired,
      success: !!repaired,
      message: repaired ? `Fixed structure for ${field}` : `Failed to fix structure for ${field}`,
    };
  }

  return {
    strategy: "structural",
    field,
    success: false,
    message: `Unhandled structural error: ${error.message}`,
  };
}

function repairMissingField(data: unknown, field: string): unknown {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const obj = data as Record<string, unknown>;
  const parts = field.split(".");

  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) {
      current[parts[i]] = {};
    }
    current = current[parts[i]] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];

  // Infer type from field name or use empty string as default
  let defaultValue: unknown = "";
  if (lastPart.includes("count") || lastPart.includes("number")) defaultValue = 0;
  else if (lastPart.includes("date")) defaultValue = new Date().toISOString();
  else if (lastPart.includes("required")) defaultValue = true;
  else if (lastPart.includes("items") || lastPart.includes("list")) defaultValue = [];

  current[lastPart] = defaultValue;
  return obj;
}

function ensureStructure(data: unknown, field: string, errorMsg: string): unknown {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const obj = data as Record<string, unknown>;
  const parts = field.split(".");
  let current = obj;

  for (const part of parts) {
    if (!(part in current) || current[part] === null || current[part] === undefined) {
      if (errorMsg.includes("array")) {
        current[part] = [];
      } else {
        current[part] = {};
      }
    }

    const next = current[part];
    if (typeof next === "object") {
      current = next as Record<string, unknown>;
    }
  }

  return obj;
}

// ============= FIELD TYPE REPAIRS =============

export function repairFieldError(
  data: unknown,
  error: ValidationError,
  field: string
): RepairOperation {
  const errorMsg = error.message.toLowerCase();

  // String validation
  if (errorMsg.includes("string")) {
    const repaired = coerceToType(data, field, "string");
    return {
      strategy: "field",
      field,
      original: getFieldValue(data, field),
      repaired,
      success: true,
      message: `Coerced ${field} to string`,
    };
  }

  // Number validation
  if (errorMsg.includes("number") || errorMsg.includes("integer")) {
    const repaired = coerceToType(data, field, "number");
    return {
      strategy: "field",
      field,
      original: getFieldValue(data, field),
      repaired,
      success: true,
      message: `Coerced ${field} to number`,
    };
  }

  // Boolean validation
  if (errorMsg.includes("boolean")) {
    const repaired = coerceToType(data, field, "boolean");
    return {
      strategy: "field",
      field,
      original: getFieldValue(data, field),
      repaired,
      success: true,
      message: `Coerced ${field} to boolean`,
    };
  }

  // Enum/literal validation
  if (errorMsg.includes("enum") || errorMsg.includes("literal")) {
    const extractedValue = extractEnumValue(errorMsg);
    if (extractedValue) {
      const repaired = setFieldValue(data, field, extractedValue);
      return {
        strategy: "field",
        field,
        original: getFieldValue(data, field),
        repaired,
        success: true,
        message: `Set ${field} to valid value: ${extractedValue}`,
      };
    }
  }

  return {
    strategy: "field",
    field,
    success: false,
    message: `Cannot repair field error: ${error.message}`,
  };
}

function coerceToType(data: unknown, field: string, type: string): unknown {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  const obj = { ...data } as Record<string, unknown>;
  const value = getFieldValue(obj, field);

  let coerced: unknown;

  switch (type) {
    case "string":
      coerced = String(value || "");
      break;
    case "number":
      coerced = Number(value) || 0;
      break;
    case "boolean":
      coerced = Boolean(value);
      break;
    default:
      coerced = value;
  }

  return setFieldValue(obj, field, coerced);
}

function getFieldValue(data: unknown, field: string): unknown {
  if (typeof data !== "object" || data === null) {
    return undefined;
  }

  const parts = field.split(".");
  let current: unknown = data;

  for (const part of parts) {
    if (typeof current === "object" && current !== null) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

function setFieldValue(data: unknown, field: string, value: unknown): unknown {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  const obj = data as Record<string, unknown>;
  const parts = field.split(".");

  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
      current[parts[i]] = {};
    }
    current = current[parts[i]] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
  return obj;
}

function extractEnumValue(errorMsg: string): string | null {
  // Try to extract valid values from error message
  // Example: "Expected 'form' | 'list' | 'detail' | 'dashboard'"
  const match = errorMsg.match(/Expected ['\"](\w+)['\"]/);
  if (match) {
    return match[1];
  }
  return null;
}

// ============= CONSISTENCY REPAIRS =============

export function repairConsistencyError(
  data: unknown,
  error: ValidationError
): RepairOperation {
  const errorMsg = error.message.toLowerCase();
  const field = error.field || "unknown";

  // Check for circular references or missing relationships
  if (errorMsg.includes("relationship") || errorMsg.includes("reference")) {
    return {
      strategy: "consistency",
      field,
      success: false,
      message: `Cannot auto-repair relationship error: ${error.message}`,
    };
  }

  // Check for version mismatches
  if (errorMsg.includes("version") && errorMsg.includes("expected")) {
    const repaired = setFieldValue(data, field, "0.1");
    return {
      strategy: "consistency",
      field: "version",
      original: getFieldValue(data, "version"),
      repaired,
      success: true,
      message: `Fixed version to 0.1`,
    };
  }

  // Check for minimum/maximum constraints
  if (errorMsg.includes("at least")) {
    const minMatch = errorMsg.match(/at least (\d+)/);
    if (minMatch) {
      const min = parseInt(minMatch[1], 10);
      const current = getFieldValue(data, field);

      if (Array.isArray(current) && current.length < min) {
        // Pad with empty items
        while (current.length < min) {
          current.push({});
        }
        return {
          strategy: "consistency",
          field,
          success: true,
          message: `Added minimum required items to ${field}`,
        };
      }
    }
  }

  return {
    strategy: "consistency",
    field,
    success: false,
    message: `Cannot repair consistency error: ${error.message}`,
  };
}

// ============= REPAIR ORCHESTRATOR =============

export class RepairEngine {
  private repairs: RepairOperation[] = [];
  private logs: RepairLog[] = [];

  repair(
    data: unknown,
    error: ValidationError,
    stage: string = error.stage
  ): { repaired: unknown; log: RepairLog } {
    let operation: RepairOperation;
    let repaired = data;

    // Dispatch to appropriate repair strategy
    if (error.message.includes("required") || error.message.includes("array") || error.message.includes("object")) {
      operation = repairStructuralError(data, error);
    } else if (
      error.message.includes("string") ||
      error.message.includes("number") ||
      error.message.includes("boolean") ||
      error.message.includes("enum")
    ) {
      operation = repairFieldError(data, error, error.field || "unknown");
    } else {
      operation = repairConsistencyError(data, error);
    }

    if (operation.success && operation.repaired) {
      repaired = operation.repaired;
    }

    const log: RepairLog = {
      stage,
      strategy: operation.strategy,
      field: operation.field,
      original: operation.original,
      repaired: operation.repaired,
      success: operation.success,
    };

    this.repairs.push(operation);
    this.logs.push(log);

    return { repaired, log };
  }

  repairMultiple(
    data: unknown,
    errors: ValidationError[],
    stage: string
  ): { repaired: unknown; logs: RepairLog[] } {
    let repaired = data;
    const logs: RepairLog[] = [];

    for (const error of errors) {
      if (error.repairable) {
        const { repaired: newData, log } = this.repair(repaired, error, stage);
        repaired = newData;
        logs.push(log);
      }
    }

    return { repaired, logs };
  }

  getLogs(): RepairLog[] {
    return this.logs;
  }

  getStats(): { total: number; successful: number; failed: number; successRate: number } {
    const total = this.repairs.length;
    const successful = this.repairs.filter((r) => r.success).length;
    const failed = total - successful;
    const successRate = total > 0 ? successful / total : 0;

    return { total, successful, failed, successRate };
  }

  reset(): void {
    this.repairs = [];
    this.logs = [];
  }
}

export const repairEngine = new RepairEngine();
