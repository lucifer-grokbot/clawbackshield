// Official SSA / CFR sources cited in quotable answers. Only link real, official pages.
export const SRC = {
  overpayments: ["SSA: Overpayments", "https://www.ssa.gov/manage-benefits/overpayments"],
  poms350: ["SSA POMS GN 02250.350", "https://secure.ssa.gov/poms.nsf/lnx/0202250350"],
  cfr404506: ["20 CFR 404.506", "https://www.ssa.gov/OP_Home/cfr20/404/404-0506.htm"],
  cfr416550: ["20 CFR 416.550", "https://www.ssa.gov/OP_Home/cfr20/416/416-0550.htm"],
  form632: ["Form SSA-632-BK", "https://www.ssa.gov/forms/ssa-632-bk.pdf"],
  form561: ["Form SSA-561", "https://www.ssa.gov/forms/ssa-561.html"],
  form634: ["Form SSA-634", "https://www.ssa.gov/forms/ssa-634.html"],
} as const satisfies Record<string, readonly [string, string]>;
export type QA = { q: string; a: string; src: (readonly [string, string])[] };
