// Deliberately its own file, with no "use client" directive: a Server
// Component (the (main) layout) needs this cookie name to read the
// incoming request's cookie, and re-exporting a plain constant across a
// "use client" boundary resolves to `undefined` server-side — Next.js
// replaces a client module's exports with client-reference stubs for RSC
// serialization, which only work for components, not plain data. Both
// the server layout and the client AgeGate component import this same
// boundary-free constant instead.
export const AGE_GATE_COOKIE_NAME = "lc_age_verified"
