import SupervisorPanel from "@/components/supervisor-panel";
import { getEvalQuestionsFromNotion } from "@/lib/server/eval-notion";
import { requireSupervisorSession } from "@/lib/server/supervisor-session";

export default async function SupervisorPage() {
  await requireSupervisorSession();
  const evalQuestions = await getEvalQuestionsFromNotion();

  return <SupervisorPanel evalQuestions={evalQuestions} />;
}
