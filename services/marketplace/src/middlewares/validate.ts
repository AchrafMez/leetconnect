import { Request, Response, NextFunction } from "express";

// ─── Shared helpers ────────────────────────────────────────────────

/** Trim a string and ensure it's a string (not array/object). Returns empty string if invalid. */
const str = (v: unknown): string =>
  typeof v === "string" ? v.trim() : "";

/** Safely coerce to a positive finite number, or return null. */
const positiveNum = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Safely coerce to a positive integer, or return null. */
const positiveInt = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

/** Basic XSS / injection strip — removes HTML tags and trims. */
const stripHtml = (s: string): string =>
  s.replace(/<[^>]*>/g, "").trim();

/** Ensure value is an array of non-empty trimmed strings (max length enforced). */
const strArray = (v: unknown, maxLen: number): string[] | null => {
  if (!Array.isArray(v)) return null;
  const cleaned = v
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((s) => s.length > 0);
  if (cleaned.length === 0 || cleaned.length > maxLen) return null;
  return cleaned;
};

// ─── Job validation ────────────────────────────────────────────────

export function validateJob(req: Request, res: Response, next: NextFunction) {
  const errors: string[] = [];

  const title = stripHtml(str(req.body.title));
  const category = stripHtml(str(req.body.category));
  const description = stripHtml(str(req.body.description));
  const budget = positiveNum(req.body.budget);
  const skills = strArray(req.body.skills, 30);

  if (!title || title.length < 5 || title.length > 200)
    errors.push("Title must be between 5 and 200 characters");

  if (!category || category.length > 100)
    errors.push("Category is required");

  if (!description || description.length < 20 || description.length > 5000)
    errors.push("Description must be between 20 and 5000 characters");

  if (!budget || budget > 1_000_000)
    errors.push("Budget must be a positive number up to 1,000,000");

  if (!skills)
    errors.push("Skills must be a non-empty array (max 30 items)");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Replace raw body with sanitized values
  req.body.title = title;
  req.body.category = category;
  req.body.description = description;
  req.body.budget = budget;
  req.body.skills = skills!.map(stripHtml);

  next();
}

// ─── Job update validation ─────────────────────────────────────────

export function validateJobUpdate(req: Request, res: Response, next: NextFunction) {
  const errors: string[] = [];

  if (req.body.title !== undefined) {
    const title = stripHtml(str(req.body.title));
    if (!title || title.length < 5 || title.length > 200)
      errors.push("Title must be between 5 and 200 characters");
    req.body.title = title;
  }

  if (req.body.category !== undefined) {
    const category = stripHtml(str(req.body.category));
    if (!category || category.length > 100)
      errors.push("Category is required");
    req.body.category = category;
  }

  if (req.body.description !== undefined) {
    const description = stripHtml(str(req.body.description));
    if (!description || description.length < 20 || description.length > 5000)
      errors.push("Description must be between 20 and 5000 characters");
    req.body.description = description;
  }

  if (req.body.budget !== undefined) {
    const budget = positiveNum(req.body.budget);
    if (!budget || budget > 1_000_000)
      errors.push("Budget must be a positive number up to 1,000,000");
    req.body.budget = budget;
  }

  if (req.body.skills !== undefined) {
    const skills = strArray(req.body.skills, 30);
    if (!skills)
      errors.push("Skills must be a non-empty array (max 30 items)");
    else
      req.body.skills = skills.map(stripHtml);
  }

  if (req.body.status !== undefined) {
    const validStatuses = ["OPEN", "IN_PROGRESS", "COMPLETED", "CLOSED"];
    if (!validStatuses.includes(req.body.status))
      errors.push("Invalid status value");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

// ─── Proposal validation ───────────────────────────────────────────

export function validateProposal(req: Request, res: Response, next: NextFunction) {
  const errors: string[] = [];

  const coverLetter = stripHtml(str(req.body.coverLetter));
  const proposedBudget = positiveNum(req.body.proposedBudget);
  const deliveryDays = positiveInt(req.body.deliveryDays);

  if (!coverLetter || coverLetter.length < 10 || coverLetter.length > 5000)
    errors.push("Cover letter must be between 10 and 5000 characters");

  if (!proposedBudget || proposedBudget > 1_000_000)
    errors.push("Proposed budget must be a positive number up to 1,000,000");

  if (!deliveryDays || deliveryDays > 365)
    errors.push("Delivery days must be a positive integer up to 365");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Replace raw body with sanitized values
  req.body.coverLetter = coverLetter;
  req.body.proposedBudget = proposedBudget;
  req.body.deliveryDays = deliveryDays;

  next();
}

// ─── Review validation ─────────────────────────────────────────────

export function validateReview(req: Request, res: Response, next: NextFunction) {
  const errors: string[] = [];

  const jobId = str(req.body.jobId);
  const toUserId = str(req.body.toUserId);
  const rating = Number(req.body.rating);
  const comment = stripHtml(str(req.body.comment));

  if (!jobId)
    errors.push("Job ID is required");

  if (!toUserId)
    errors.push("Target user ID is required");

  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    errors.push("Rating must be an integer between 1 and 5");

  if (!comment || comment.length < 1 || comment.length > 2000)
    errors.push("Comment must be between 1 and 2000 characters");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Replace raw body with sanitized values
  req.body.jobId = jobId;
  req.body.toUserId = toUserId;
  req.body.rating = rating;
  req.body.comment = comment;

  next();
}

// ─── UUID param validation ─────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validates that req.params[paramName] is a valid UUID. */
export function validateIdParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    if (!value || typeof value !== 'string' || !UUID_RE.test(value)) {
      return res.status(400).json({ success: false, message: `Invalid ${paramName}` });
    }
    next();
  };
}
