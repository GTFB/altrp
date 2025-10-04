// Simple utility for testing authentication
// This file can be deleted after setup

export function checkAuthConfig() {
  const requiredEnvVars = ["NEXTAUTH_SECRET", "NEXTAUTH_URL"];

  const optionalEnvVars = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
  ];

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  const configured = optionalEnvVars.filter((envVar) => process.env[envVar]);

  return {
    missing,
    configured,
    isReady: missing.length === 0,
    hasOAuth: configured.length > 0,
  };
}

export function logAuthStatus() {
  const status = checkAuthConfig();

  console.log("🔐 Auth Configuration Status:");
  console.log(
    "Required vars:",
    status.missing.length === 0
      ? "✅ All set"
      : `❌ Missing: ${status.missing.join(", ")}`,
  );
  console.log(
    "OAuth providers:",
    status.hasOAuth
      ? `✅ Configured: ${status.configured.length}`
      : "❌ None configured",
  );
  console.log("Ready:", status.isReady ? "✅ Yes" : "❌ No");

  return status;
}
