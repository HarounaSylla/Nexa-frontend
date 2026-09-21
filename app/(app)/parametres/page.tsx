import { PageTabs } from "@/components/page-tabs";
import { PARAMETRES_TABS } from "@/lib/nav";
import { pageTitleClass } from "@/lib/ui";

export default function ParametresPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className={pageTitleClass}>Paramètres</h1>
      <PageTabs label="Paramètres sections" tabs={PARAMETRES_TABS} />
    </div>
  );
}
