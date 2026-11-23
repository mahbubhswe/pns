import { redirect } from "next/navigation";

/** The committee is a section of the home page now; keep old links working. */
export default function CommitteePage() {
  redirect("/#committee");
}
