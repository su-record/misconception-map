export function isDemoMode() {
  return ["1", "true"].includes(process.env.DEMO_MODE?.toLowerCase() ?? "");
}
