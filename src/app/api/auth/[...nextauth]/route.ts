// src/app/api/auth/[...nextauth]/route.ts
// NextAuth.js route handler

import { handlers } from "@/lib/auth";

// Export the NextAuth handlers
export const { GET, POST } = handlers;
