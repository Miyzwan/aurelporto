import * as z from "zod";

export const emptyText = z.string().trim().max(5000);
