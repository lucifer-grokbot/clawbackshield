// Official SSA / CFR sources cited in quotable answers. Only link real, official pages.
export const SRC = {
  overpayments: ["SSA: Resolve an overpayment", "https://www.ssa.gov/manage-benefits/resolve-overpayment"],
  poms350: ["SSA POMS GN 02250.350", "https://secure.ssa.gov/poms.nsf/lnx/0202250350"],
  cfr404506: ["20 CFR 404.506", "https://www.ssa.gov/OP_Home/cfr20/404/404-0506.htm"],
  cfr416550: ["20 CFR 416.550", "https://www.ssa.gov/OP_Home/cfr20/416/416-0550.htm"],
  form632: ["Form SSA-632-BK", "https://www.ssa.gov/forms/ssa-632-bk.pdf"],
  form561: ["Form SSA-561", "https://www.ssa.gov/forms/ssa-561.html"],
  cfr404909: ["20 CFR 404.909", "https://www.ssa.gov/OP_Home/cfr20/404/404-0909.htm"],
  cfr4161409: ["20 CFR 416.1409", "https://www.ssa.gov/OP_Home/cfr20/416/416-1409.htm"],
  cfr404901: ["20 CFR 404.901", "https://www.ssa.gov/OP_Home/cfr20/404/404-0901.htm"],
  cfr404502a: ["20 CFR 404.502a", "https://www.ssa.gov/OP_Home/cfr20/404/404-0502a.htm"],
  poms025: ["SSA POMS GN 02201.025", "https://secure.ssa.gov/apps10/poms.nsf/lnx/0202201025"],
  form634: ["Form SSA-634", "https://www.ssa.gov/forms/ssa-634.html"],
} as const satisfies Record<string, readonly [string, string]>;
export type QA = { q: string; a: string; src: (readonly [string, string])[] };
