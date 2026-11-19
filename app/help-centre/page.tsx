import { redirect } from "next/navigation";

// The video training hub listed videos that were never recorded. Until real
// videos exist, send users to the written help articles.
export default function HelpCentrePage() {
  redirect("/help");
}
