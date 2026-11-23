import { z } from "zod";

/** Finishing set-up after a Google sign-up. */
export const onboardingSchema = z.object({
  companyName: z.string().trim().min(1, "Enter your company name.").max(200, "Keep the name under 200 characters."),
  consent: z.literal(true, "Please agree to the privacy notice to continue."),
});

export const renameCompanySchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(200, "Keep the name under 200 characters."),
});

/** Deleting a company needs its exact name, so it cannot happen by accident. */
export const deleteCompanySchema = z.object({ confirmName: z.string() });

/** One inline edit. The value is checked against the field registry on the server. */
export const fieldEditSchema = z.object({ path: z.string(), value: z.unknown() });

export const logoUploadSchema = z.object({ file: z.instanceof(File, { message: "Choose an image to upload." }) });
