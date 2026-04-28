import TrainingApp from "@/components/training-app";
import { getComercialFromNotion } from "@/lib/server/comercial-notion";
import { getEvalQuestionsFromNotion } from "@/lib/server/eval-notion";
import { getInfoAdicionalFromNotion } from "@/lib/server/info-adicional-notion";
import { getIntroFromNotion } from "@/lib/server/intro-notion";
import { getProtocolsFromNotion } from "@/lib/server/protocols-notion";
import { getProductsFromNotion } from "@/lib/server/products-notion";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    { products, meta: mod1Meta },
    { protocols, meta: mod2Meta },
    evalQuestions,
    { intro, meta: mod0Meta },
    { comercial, meta: mod3Meta },
    infoAdicional,
  ] = await Promise.all([
    getProductsFromNotion(),
    getProtocolsFromNotion(),
    getEvalQuestionsFromNotion(),
    getIntroFromNotion(),
    getComercialFromNotion(),
    getInfoAdicionalFromNotion(),
  ]);

  return (
    <TrainingApp
      products={products}
      protocols={protocols}
      intro={intro}
      comercial={comercial}
      infoAdicional={infoAdicional}
      moduleMeta={[mod0Meta, mod1Meta, mod2Meta, mod3Meta]}
      evalQuestions={evalQuestions}
    />
  );
}
